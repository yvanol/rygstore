import connectDB from "@/config/db";
import Address from "@/models/Address";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    // console.log('Clerk userId (get-address):', userId);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: No user ID provided" },
        { status: 401 }
      );
    }

    await connectDB();
    const addresses = await Address.find({ userId });
    // console.log('Found addresses:', addresses);

    return NextResponse.json({
      success: true,
      message: "Addresses fetched successfully",
      addresses,
    });
  } catch (error) {
    // console.error('Error fetching addresses:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}