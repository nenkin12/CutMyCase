import { NextResponse } from "next/server";

export async function POST() {
  // Checkout is disabled - will be handled by Shopify
  return NextResponse.json(
    { error: "Checkout coming soon - Shopify integration pending" },
    { status: 503 }
  );
}
