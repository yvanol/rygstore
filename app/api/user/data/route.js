import connectDB from "@/config/db";
import User from "@/models/User";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        console.log('Clerk userId (data):', userId);

        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        let user = await User.findOne({ _id: userId });
        console.log('Found user (data):', user);

        if (!user) {
            const clerkUser = await clerkClient.users.getUser(userId);
            user = new User({
                _id: userId,
                name: clerkUser.fullName || 'Unknown',
                email: clerkUser.emailAddresses[0]?.emailAddress || 'unknown@example.com',
                imageUrl: clerkUser.imageUrl || '',
                cartItem: {},
            });
            await user.save();
            console.log('Created new user (data):', user);
        }

        return NextResponse.json({ success: true, user: { ...user.toObject(), cartItems: user.cartItem || {} } });
    } catch (error) {
        console.error('Error fetching user data:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}