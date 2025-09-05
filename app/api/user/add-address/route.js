import { getAuth, clerkClient } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import Address from "@/models/Address";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    // console.log("Clerk userId (add-address):", userId);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: No user ID provided" },
        { status: 401 }
      );
    }

    const { address } = await request.json();
    // console.log("Received address:", address);

    if (!address || typeof address !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid address data" },
        { status: 400 }
      );
    }

    await connectDB();
    const newAddress = await Address.create({ ...address, userId });

    return NextResponse.json({
      success: true,
      message: "Address added successfully",
      address: newAddress,
    });
  } catch (error) {
    // console.error("Error adding address:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
