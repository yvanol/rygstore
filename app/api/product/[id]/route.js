import { v2 as cloudinary } from "cloudinary";
import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Product from "@/models/Product";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// DELETE endpoint to delete a product
export async function DELETE(request, { params }) {
  try {
    const { userId } = getAuth(request);
    const productId = params.id; // Assuming the route is /api/product/[id]

    // Check if user is authorized as a seller
    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Find the product by ID and ensure it belongs to the user
    const product = await Product.findOne({ _id: productId, userId });
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found or you are not authorized to delete it" },
        { status: 404 }
      );
    }

    // Delete images from Cloudinary
    const deleteImagePromises = product.image.map(async (imageUrl) => {
      const publicId = imageUrl.split("/").pop().split(".")[0]; // Extract public ID from URL
      return cloudinary.uploader.destroy(publicId);
    });
    await Promise.all(deleteImagePromises);

    // Delete the product from the database
    await Product.deleteOne({ _id: productId });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    }, { status: 200 });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}