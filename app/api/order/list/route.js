import connectDB from "@/config/db";
import Address from "@/models/Address";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    // Check if userId exists
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: No user ID found" },
        { status: 401 }
      );
    }

    // Connect to the database
    await connectDB();

    // Fetch orders for the authenticated user with COD or paid Stripe orders
    const orders = await Order.find({
      userId
    }).populate('address items.product');

    // Debugging: Log the number of orders found
    console.log(`Found ${orders.length} orders for user ${userId}`);

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    // Log error for debugging
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
