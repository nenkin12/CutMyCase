import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { generateOrderNumber } from "@/lib/utils";
import type { CartItem } from "@/stores/cart-store";

interface CheckoutRequest {
  items: CartItem[];
  shipping: {
    email: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const { items, shipping }: CheckoutRequest = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const shippingCost = subtotal > 10000 ? 0 : 999;
    const tax = Math.round(subtotal * 0.0825);
    const total = subtotal + shippingCost + tax;

    // Create or get user
    let userId = session?.user?.id;

    if (!userId) {
      // Create guest user
      const user = await db.user.create({
        data: {
          email: shipping.email,
          name: shipping.name,
        },
      });
      userId = user.id;
    }

    // Create address
    const address = await db.address.create({
      data: {
        userId,
        name: shipping.name,
        line1: shipping.address,
        city: shipping.city,
        state: shipping.state,
        zip: shipping.zip,
        country: "US",
        isDefault: true,
      },
    });

    // Create order
    const order = await db.order.create({
      data: {
        userId,
        orderNumber: generateOrderNumber(),
        status: "PENDING",
        subtotal,
        shipping: shippingCost,
        tax,
        total,
        shippingAddressId: address.id,
        items: {
          create: items.map((item) => ({
            productId: item.productId || null,
            foamOptionId: item.foamOptionId || null,
            uploadId: item.uploadId || null,
            name: item.productName,
            description: item.foamOptionName || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
            isCustomCut: item.isCustomCut,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Create Stripe checkout session
    const stripeSession = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: shipping.email,
      line_items: items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.productName,
            description: item.foamOptionName || undefined,
          },
          unit_amount: item.unitPrice,
        },
        quantity: item.quantity,
      })),
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: shippingCost,
              currency: "usd",
            },
            display_name: shippingCost === 0 ? "Free Shipping" : "Standard Shipping",
          },
        },
      ],
      metadata: {
        orderId: order.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cart`,
    });

    // Update order with Stripe session ID
    await db.order.update({
      where: { id: order.id },
      data: { stripeSessionId: stripeSession.id },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
