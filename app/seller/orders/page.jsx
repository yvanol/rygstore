"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";

const Orders = () => {
  const { currency, getToken, user } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSellerOrders = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/order/seller-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setOrders(data.orders);
        setLoading(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch orders");
      setLoading(false); // Ensure loading state is cleared on error
    }
  };

  useEffect(() => {
    if (user) {
      fetchSellerOrders();
    }
  }, [user]);

  return (
    <div className="flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm">
      {loading ? (
        <Loading />
      ) : orders.length === 0 ? (
        <div className="md:p-10 p-4">
          <h2 className="text-lg font-medium">Orders</h2>
          <p className="text-center mt-5">No orders found.</p>
        </div>
      ) : (
        <div className="md:p-10 p-4 space-y-5">
          <h2 className="text-lg font-medium">Orders</h2>
          <div className="max-w-4xl rounded-md">
            {orders.map((order, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row gap-5 justify-between p-5 border-t border-gray-300"
              >
                <div className="flex-1 flex gap-5 max-w-80">
                  <Image
                    className="max-w-16 max-h-16 object-cover"
                    src={assets.box_icon}
                    alt="box_icon"
                  />
                  <p className="flex flex-col gap-3">
                    <span className="font-medium">
                      {order.items
                        .map((item) =>
                          item.product?.name
                            ? `${item.product.name} x ${item.quantity}`
                            : `Unknown Product x ${item.quantity}`
                        )
                        .join(", ")}
                    </span>
                    <span>Items: {order.items.length}</span>
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-medium">
                      {order.address?.fullName || "Unknown Name"}
                    </span>
                    <br />
                    <span>{order.address?.area || "Unknown Area"}</span>
                    <br />
                    <span>
                      {order.address?.city && order.address?.state
                        ? `${order.address.city}, ${order.address.state}`
                        : "Unknown Location"}
                    </span>
                    <br />
                    <span>
                      {order.address?.phoneNumber || "Unknown Phone"}
                    </span>
                  </p>
                </div>
                <p className="font-medium my-auto">
                  {currency}
                  {order.amount || "0"}
                </p>
                <div>
                  <p className="flex flex-col">
                    <span>Method: COD</span>
                    <span>
                      Date: {new Date(order.date).toLocaleDateString()}
                    </span>
                    <span>Payment: Pending</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Orders;