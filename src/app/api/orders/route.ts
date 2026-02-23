import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePreviewSvg } from "@/lib/cnc/generate-outline";

// Generate a unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CMC-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      layoutItems,
      caseId,
      caseName,
      caseWidth,
      caseHeight,
      needsCase,
      fingerPulls,
      customerEmail,
      customerName,
      customerPhone,
      customerNotes,
      sessionId,
    } = body;

    // Validate required fields
    if (!layoutItems || !Array.isArray(layoutItems) || layoutItems.length === 0) {
      return NextResponse.json(
        { error: "Layout items are required" },
        { status: 400 }
      );
    }

    if (!caseWidth || !caseHeight) {
      return NextResponse.json(
        { error: "Case dimensions are required" },
        { status: 400 }
      );
    }

    // Generate SVG from layout items
    const outlines = layoutItems.map((item: {
      id: string;
      name: string;
      points: number[][];
      x: number;
      y: number;
      rotation: number;
      width: number;
      height: number;
      depth: number;
    }) => ({
      id: item.id,
      name: item.name,
      outerPath: item.points.map((p: number[]) => ({ x: p[0], y: p[1] })),
      innerPaths: [],
      position: { x: item.x, y: item.y },
      rotation: item.rotation,
    }));

    const svgData = generatePreviewSvg(outlines, {}, caseWidth, caseHeight);

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        status: "PENDING",
        sessionId: sessionId || null,

        // Design data
        designData: layoutItems,
        svgData,
        caseId,
        caseName,
        caseWidth,
        caseHeight,
        needsCase: needsCase || false,
        fingerPulls: fingerPulls ?? true,

        // Contact info
        customerEmail,
        customerName,
        customerPhone,
        customerNotes,

        // Placeholder pricing (to be calculated)
        subtotal: 0,
        shipping: 0,
        tax: 0,
        total: 0,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const orders = await prisma.order.findMany({
      where: status ? { status: status as "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
