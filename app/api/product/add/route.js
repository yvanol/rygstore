import { v2 as cloudinary } from "cloudinary"; // Removed duplicate import
import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Product from "@/models/Product"; // Import the Product model (adjust path as needed)

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    // Check if user is authorized as a seller
    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Get form data
    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const category = formData.get("category");
    const price = formData.get("price");
    const offerPrice = formData.get("offerPrice");
    const files = formData.getAll("images");

    // Validate form data
    if (!name || !description || !category || !price || !files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "Missing required fields or no files uploaded" },
        { status: 400 }
      );
    }

    // Upload files to Cloudinary
    const uploadPromises = files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "auto" },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result); // Fixed: Resolve with result, not error
            }
          }
        );
        stream.end(buffer);
      });
    });

    const results = await Promise.all(uploadPromises);
    const imageUrls = results.map((result) => result.secure_url); // Extract secure_url

    // Connect to database and create product
    await connectDB();
    const newProduct = await Product.create({
      userId,
      name,
      description,
      category,
      price: Number(price),
      offerPrice: offerPrice ? Number(offerPrice) : undefined, // Handle optional offerPrice
      image: imageUrls,
      date: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: "Product uploaded successfully",
      newProduct,
    }, { status: 201 });
  } catch (error) {
    console.error("Error uploading product:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}