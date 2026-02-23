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

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // First, fetch the existing order
    const fileName = `orders/${id}.json`;
    const fileUrl = `${FIREBASE_STORAGE_URL}/${encodeURIComponent(fileName)}?alt=media`;

    const getResponse = await fetch(fileUrl);

    if (!getResponse.ok) {
      if (getResponse.status === 404) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }
      throw new Error("Failed to fetch order");
    }

    const existingOrder = await getResponse.json();

    // Update the order data
    const updatedOrder = {
      ...existingOrder,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    // Handle status-specific timestamps
    if (body.status === "SHIPPED" && !existingOrder.shippedAt) {
      updatedOrder.shippedAt = new Date().toISOString();
    }
    if (body.status === "DELIVERED" && !existingOrder.deliveredAt) {
      updatedOrder.deliveredAt = new Date().toISOString();
    }

    // Save updated order back to Firebase Storage
    const uploadUrl = `${FIREBASE_STORAGE_URL}/${encodeURIComponent(fileName)}?uploadType=media`;

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedOrder),
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to update order");
    }

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
