import connectDB from "@/config/db";
import Order from "@/models/Order";
import User from "@/models/User";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export async function POST(request) {
  try {
    // Get the raw body for Stripe webhook verification
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    if (!sig) {
      console.log("Missing stripe-signature header");
      return NextResponse.json(
        { success: false, message: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    // Verify the webhook event
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { success: false, message: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    const handlePaymentIntent = async (paymentIntentId, isPaid) => {
      // Retrieve the session to get metadata
      const sessionList = await stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
        limit: 1,
      });

      if (!sessionList.data.length) {
        console.log(`No session found for payment intent: ${paymentIntentId}`);
        return;
      }

      const { orderId, userId } = sessionList.data[0].metadata || {};

      if (!orderId || !userId) {
        console.log(`Missing metadata in session for payment intent: ${paymentIntentId}`);
        return;
      }

      await connectDB();

      if (isPaid) {
        // Update order to mark as paid
        const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          { isPaid: true },
          { new: true }
        );
        if (!updatedOrder) {
          console.log(`Order not found: ${orderId}`);
          return;
        }

        // Clear user's cart
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { cartItem: {} },
          { new: true }
        );
        if (!updatedUser) {
          console.log(`User not found: ${userId}`);
        }
      } else {
        // Delete order if payment is canceled
        const deletedOrder = await Order.findByIdAndDelete(orderId);
        if (!deletedOrder) {
          console.log(`Order not found for deletion: ${orderId}`);
        }
      }
    };

    // Handle specific webhook events
    switch (event.type) {
      case "payment_intent.succeeded":
        console.log(`Processing payment_intent.succeeded for payment intent: ${event.data.object.id}`);
        await handlePaymentIntent(event.data.object.id, true);
        break;
      case "payment_intent.canceled":
        console.log(`Processing payment_intent.canceled for payment intent: ${event.data.object.id}`);
        await handlePaymentIntent(event.data.object.id, false);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
        break;
    }

    return NextResponse.json({ success: true, received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Webhook processing failed" },
      { status: 400 }
    );
  }
}