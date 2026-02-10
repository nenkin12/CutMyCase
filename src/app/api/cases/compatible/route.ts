import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateOutlinesForCase } from "@/lib/cnc/export-dxf";
import type { OutlineResult } from "@/lib/ai/process-image";
import type { Product, FoamOption } from "@prisma/client";

type ProductWithFoam = Product & { foamOptions: FoamOption[] };

interface CompatibleRequest {
  outlines: OutlineResult;
  tolerance: number;
}

export async function POST(request: NextRequest) {
  try {
    const { outlines, tolerance }: CompatibleRequest = await request.json();

    // Get all active products
    const products = await db.product.findMany({
      where: { isActive: true },
      include: {
        foamOptions: {
          where: { name: "Custom Cut" },
        },
      },
      orderBy: { basePrice: "asc" },
    });

    // Check compatibility for each case
    const casesWithCompatibility = products.map((product: ProductWithFoam) => {
      const validation = validateOutlinesForCase(
        outlines.outlines,
        product.interiorWidth,
        product.interiorLength,
        tolerance
      );

      return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        image: product.image,
        interiorLength: product.interiorLength,
        interiorWidth: product.interiorWidth,
        interiorDepth: product.interiorDepth,
        basePrice: product.basePrice,
        customCutPrice: product.foamOptions[0]?.price || 4999,
        fits: validation.fits,
        overflow: validation.fits
          ? null
          : {
              width: validation.totalBounds.width - product.interiorWidth,
              height: validation.totalBounds.height - product.interiorLength,
            },
      };
    });

    // Sort: compatible first, then by price
    casesWithCompatibility.sort((a, b) => {
      if (a.fits && !b.fits) return -1;
      if (!a.fits && b.fits) return 1;
      return a.basePrice - b.basePrice;
    });

    return NextResponse.json({ cases: casesWithCompatibility });
  } catch (error) {
    console.error("Compatible cases error:", error);
    return NextResponse.json(
      { error: "Failed to check compatible cases" },
      { status: 500 }
    );
  }
}
