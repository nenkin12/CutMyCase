import { NextRequest, NextResponse } from "next/server";
import { generatePreviewSvg } from "@/lib/cnc/generate-outline";

// Firebase Storage URL for storing orders as JSON files
const FIREBASE_STORAGE_URL = `https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o`;

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

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const orderNumber = generateOrderNumber();
    const now = new Date().toISOString();

    // Create order data object
    const orderData = {
      id: orderId,
      orderNumber,
      status: "PENDING",
      sessionId: sessionId || null,
      designData: layoutItems,
      svgData,
      caseId: caseId || null,
      caseName: caseName || null,
      caseWidth,
      caseHeight,
      needsCase: needsCase || false,
      fingerPulls: fingerPulls ?? true,
      customerEmail: customerEmail || null,
      customerName: customerName || null,
      customerPhone: customerPhone || null,
      customerNotes: customerNotes || null,
      subtotal: 0,
      shipping: 0,
      tax: 0,
      total: 0,
      createdAt: now,
      updatedAt: now,
    };

    // Store order as JSON file in Firebase Storage
    const fileName = `orders/${orderId}.json`;
    const uploadUrl = `${FIREBASE_STORAGE_URL}/${encodeURIComponent(fileName)}?uploadType=media`;

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("Firebase Storage upload error:", errorText);
      throw new Error("Failed to save order");
    }

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
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
    // List all order files from Firebase Storage
    const listUrl = `${FIREBASE_STORAGE_URL}?prefix=orders%2F`;
    const listResponse = await fetch(listUrl);

    if (!listResponse.ok) {
      // If no orders exist yet, return empty array
      if (listResponse.status === 404) {
        return NextResponse.json({ orders: [] });
      }
      throw new Error("Failed to fetch orders");
    }

    const listData = await listResponse.json();
    const items = listData.items || [];

    // Fetch each order file
    const orders = await Promise.all(
      items.slice(0, 100).map(async (item: { name: string }) => {
        try {
          const fileUrl = `${FIREBASE_STORAGE_URL}/${encodeURIComponent(item.name)}?alt=media`;
          const fileResponse = await fetch(fileUrl);
          if (fileResponse.ok) {
            return await fileResponse.json();
          }
          return null;
        } catch {
          return null;
        }
      })
    );

    // Filter out nulls and sort by createdAt
    const validOrders = orders
      .filter((order): order is Record<string, unknown> => order !== null)
      .sort((a, b) => {
        const aDate = (a.createdAt as string) || "";
        const bDate = (b.createdAt as string) || "";
        return bDate.localeCompare(aDate);
      });

    // Filter by status if provided
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const filteredOrders = status
      ? validOrders.filter((order) => order.status === status)
      : validOrders;

    return NextResponse.json({ orders: filteredOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
