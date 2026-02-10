import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        // Update order status
        const order = await db.order.update({
          where: { id: orderId },
          data: {
            status: "PAID",
            stripePaymentId: session.payment_intent as string,
            paidAt: new Date(),
          },
          include: {
            items: {
              where: { isCustomCut: true },
            },
          },
        });

        // Create shop jobs for custom cut items
        for (const item of order.items) {
          if (item.isCustomCut && item.uploadId) {
            await db.shopJob.create({
              data: {
                orderId: order.id,
                orderItemId: item.id,
                status: "QUEUED",
                priority: 1,
              },
            });

            // Update upload status
            await db.upload.update({
              where: { id: item.uploadId },
              data: { status: "APPROVED" },
            });
          }
        }
      }
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        await db.order.update({
          where: { id: orderId },
          data: { status: "CANCELLED" },
        });
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.error("Payment failed:", paymentIntent.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
