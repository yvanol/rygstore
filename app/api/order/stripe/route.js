import Order from "@/models/Order";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      console.log("No userId found in request");
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { address, items } = await request.json();
    const origin = request.headers.get("origin") || "http://localhost:3000";

    if (!address || !items || items.length === 0) {
      console.log("Invalid request data:", { address, items });
      return NextResponse.json({ success: false, message: "Invalid data" }, { status: 400 });
    }

    let productData = [];
    let amount = 0;

    // Calculate amount and collect product data
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        console.log(`Product not found: ${item.product}`);
        return NextResponse.json(
          { success: false, message: `Product not found: ${item.product}` },
          { status: 404 }
        );
      }
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
      amount += product.offerPrice * item.quantity;
    }

    // Add 2% tax
    const tax = Math.floor(amount * 0.02);
    const totalAmount = amount + tax;

    const order = await Order.create({
      userId,
      address,
      items,
      amount: totalAmount,
      date: Date.now(),
      paymentType: "stripe",
    });

    // Create line items for Stripe
    const line_items = productData.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/order-placed`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });

    console.log("Stripe session created:", { sessionId: session.id, url: session.url });

    return NextResponse.json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe API error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}