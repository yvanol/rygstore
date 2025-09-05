import connectDB from "@/config/db";
import User from "@/models/User";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        // console.log('Clerk userId:', userId);

        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized: No user ID provided" }, { status: 401 });
        }

        const { cartData } = await request.json();
        // console.log('Received cartData:', cartData);

        if (!cartData || typeof cartData !== 'object') {
            return NextResponse.json({ success: false, message: "Invalid cart data" }, { status: 400 });
        }

        await connectDB();
        let user = await User.findOne({ _id: userId });
        // console.log('Found user:', user);

        if (!user) {
            // Fetch Clerk user data to create a new user
            const clerkUser = await clerkClient.users.getUser(userId);
            user = new User({
                _id: userId,
                name: clerkUser.fullName || 'Unknown',
                email: clerkUser.emailAddresses[0]?.emailAddress || 'unknown@example.com',
                imageUrl: clerkUser.imageUrl || '',
                cartItem: {},
            });
            await user.save();
            // console.log('Created new user:', user);
        }

        user.cartItem = cartData;
        await user.save();
        // console.log('Updated cartItem:', user.cartItem);

        return NextResponse.json({ success: true, message: "Cart updated successfully" });
    } catch (error) {
        console.error('Error updating cart:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}