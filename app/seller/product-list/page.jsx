"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";
import axios from "axios";

const ProductList = () => {
  const { router, getToken, user } = useAppContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSellerProduct = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/product/seller-list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        console.log("Fetched products:", data.products); // Debug log
        setProducts(data.products);
        setLoading(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Fetch error:", error.message);
      toast.error(error.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
  try {
    const token = await getToken();
    console.log("Deleting product ID:", productId, "Token:", token); // Debug log
    const response = await axios.delete(`/api/product/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data.success) {
      toast.success("Product deleted successfully");
      await fetchSellerProduct(); // Refresh product list
    } else {
      toast.error(response.data.message);
    }
  } catch (error) {
    console.error("Delete error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    toast.error(error.response?.data?.message || "Failed to delete product");
  }
};

  useEffect(() => {
    if (user) {
      fetchSellerProduct();
    }
  }, [user]);

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      {loading ? (
        <Loading />
      ) : (
        <div className="w-full md:p-10 p-4">
          <h2 className="pb-4 text-lg font-medium">All Product</h2>
          <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
            <table className="table-fixed w-full overflow-hidden">
              <thead className="text-gray-900 text-sm text-left">
                <tr>
                  <th className="w-2/3 md:w-2/5 px-4 py-3 font-medium truncate">
                    Product
                  </th>
                  <th className="w-1/6 px-4 py-3 font-medium truncate max-sm:hidden">
                    Category
                  </th>
                  <th className="w-1/6 px-4 py-3 font-medium truncate">
                    Price
                  </th>
                  <th className="w-1/4 px-6 py-3 font-medium truncate max-sm:hidden">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-500">
                {products.map((product, index) => (
                  <tr key={index} className="border-t border-gray-500/20">
                    <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                      <div className="bg-gray-500/10 rounded p-2">
                        <Image
                          src={product.image[0]}
                          alt="product Image"
                          className="w-16"
                          width={1280}
                          height={720}
                        />
                      </div>
                      <span className="truncate w-full">{product.name}</span>
                    </td>
                    <td className="px-4 py-3 max-sm:hidden">
                      {product.category}
                    </td>
                    <td className="px-4 py-3">${product.offerPrice}</td>
                    <td className="px-6 py-3 max-sm:hidden">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/product/${product._id}`)}
                          className="flex items-center gap-1 px-2 md:px-4 py-2.5 bg-orange-600 text-white rounded-md text-sm md:text-base"
                        >
                          <span className="hidden md:block">Visit</span>
                          <Image
                            className="h-4 md:h-4"
                            src={assets.redirect_icon}
                            alt="redirect_icon"
                            width={16}
                            height={16}
                          />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="flex items-center gap-1 px-2 md:px-4 py-2.5 bg-red-600 text-white rounded-md text-sm md:text-base"
                        >
                          <span className="hidden md:block">Delete</span>
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ProductList;