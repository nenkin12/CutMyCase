import { NextResponse } from "next/server";

export async function POST() {
  // Stripe webhooks disabled - will be handled by Shopify
  return NextResponse.json({ received: true });
}
