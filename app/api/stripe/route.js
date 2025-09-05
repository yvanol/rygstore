import connectDB from "@/config/db";
import Order from "@/models/Order";
import User from "@/models/User";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    // Ensure database connection is established early
    await connectDB();

    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    const handlePaymentIntent = async (paymentIntentId, isPaid) => {
      const session = await stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { orderId, userId } = session.data[0].metadata;

      // Log orderId to verify it
      console.log("Processing orderId:", orderId);

      if (isPaid) {
        const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          { isPaid: true },
          { new: true }
        );
        // Log update result to confirm success
        console.log("Updated Order:", updatedOrder ? updatedOrder._id : "No order found");

        await User.findByIdAndUpdate(userId, { cartItem: {} });
      } else {
        await Order.findByIdAndDelete(orderId);
      }
    };

    // Fix switch statement to use event.type
    switch (event.type) {
      case "payment_intent.succeeded": {
        await handlePaymentIntent(event.data.object.id, true);
        break;
      }

      case "payment_intent.canceled": {
        await handlePaymentIntent(event.data.object.id, false);
        break;
      }
      default:
        console.error("Unhandled event type:", event.type);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    return NextResponse.json({ message: error.message });
  }
}

export const config = {
  api: { bodyParser: false },
};