import { NextRequest, NextResponse } from "next/server";

// Firebase Storage URL
const FIREBASE_STORAGE_URL = `https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o`;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch order JSON from Firebase Storage
    const fileName = `orders/${id}.json`;
    const fileUrl = `${FIREBASE_STORAGE_URL}/${encodeURIComponent(fileName)}?alt=media`;

    const response = await fetch(fileUrl);

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }
      throw new Error("Failed to fetch order");
    }

    const order = await response.json();

    if (!order.svgData) {
      return NextResponse.json(
        { error: "No SVG data available for this order" },
        { status: 404 }
      );
    }

    // Return SVG as a downloadable file
    const caseName = (order.caseName as string)?.replace(/\s+/g, "-") || "design";
    const filename = `${order.orderNumber}-${caseName}.svg`;

    return new NextResponse(order.svgData as string, {
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
