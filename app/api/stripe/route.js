import connectDB from "@/config/db";
import Order from "@/models/Order";
import User from "@/models/User";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(request) {
  try {
    // Get the raw body as a Buffer to preserve exact content
    const rawBody = await request.arrayBuffer();
    const body = Buffer.from(rawBody).toString("utf-8");
    const sig = request.headers.get("stripe-signature");

    // Log for debugging
    console.log("Webhook received - Raw body length:", rawBody.byteLength);
    console.log("Webhook received - Signature:", sig);

    // Validate signature header
    if (!sig) {
      console.error("Missing stripe-signature header");
      return NextResponse.json(
        { message: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    // Validate webhook secret
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("STRIPE_WEBHOOK_SECRET is not set");
      return NextResponse.json(
        { message: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody, // Pass raw Buffer instead of string
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log("Webhook event verified - Event ID:", event.id, "Type:", event.type);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      console.error("Raw body sample:", body.slice(0, 200)); // Log first 200 chars
      return NextResponse.json(
        { message: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    const handlePaymentIntent = async (paymentIntentId, isPaid) => {
      const session = await stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
        limit: 1,
      });

      if (!session.data || session.data.length === 0) {
        console.error(`No session found for payment intent: ${paymentIntentId}`);
        throw new Error("No session found");
      }

      const { orderId, userId } = session.data[0].metadata;

      if (!orderId || !userId) {
        console.error(`Invalid metadata: orderId=${orderId}, userId=${userId}`);
        throw new Error("Invalid metadata");
      }

      await connectDB();

      if (isPaid) {
        const order = await Order.findById(orderId);
        if (!order) {
          console.error(`Order not found: ${orderId}`);
          throw new Error("Order not found");
        }
        if (order.isPaid) {
          console.log(`Order ${orderId} is already paid, skipping update`);
          return;
        }

        const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          { isPaid: true },
          { new: true }
        );
        if (!updatedOrder) {
          console.error(`Failed to update order: ${orderId}`);
          throw new Error("Failed to update order");
        }

        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { cartItem: {} },
          { new: true }
        );
        if (!updatedUser) {
          console.error(`User not found: ${userId}`);
          throw new Error("User not found");
        }

        console.log(`Order ${orderId} updated to isPaid: true, user ${userId} cart cleared`);
      } else {
        const deletedOrder = await Order.findByIdAndDelete(orderId);
        if (!deletedOrder) {
          console.error(`Order not found for deletion: ${orderId}`);
          throw new Error("Order not found for deletion");
        }
        console.log(`Order ${orderId} deleted due to payment cancellation`);
      }
    };

    switch (event.type) {
      case "payment_intent.succeeded": {
        console.log(`Handling payment_intent.succeeded for event: ${event.id}`);
        await handlePaymentIntent(event.data.object.id, true);
        break;
      }
      case "payment_intent.canceled": {
        console.log(`Handling payment_intent.canceled for event: ${event.id}`);
        await handlePaymentIntent(event.data.object.id, false);
        break;
      }
      default:
        console.warn(`Unhandled event type: ${event.type}, Event ID: ${event.id}`);
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error(`Webhook error (Event ID: ${event?.id || "unknown"}):`, error.message);
    return NextResponse.json(
      { message: `Webhook error: ${error.message}` },
      { status: 400 }
    );
  }
}

export const config = {
  api: { bodyParser: false },
};