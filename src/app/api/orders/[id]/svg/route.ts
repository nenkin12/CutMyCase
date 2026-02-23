import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        orderNumber: true,
        svgData: true,
        caseName: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (!order.svgData) {
      return NextResponse.json(
        { error: "No SVG data available for this order" },
        { status: 404 }
      );
    }

    // Return SVG as a downloadable file
    const filename = `${order.orderNumber}-${order.caseName?.replace(/\s+/g, "-") || "design"}.svg`;

    return new NextResponse(order.svgData, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error fetching order SVG:", error);
    return NextResponse.json(
      { error: "Failed to fetch order SVG" },
      { status: 500 }
    );
  }
}
