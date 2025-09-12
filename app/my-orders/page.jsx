// app/my-orders/page.jsx
"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";
import axios from "axios";

const MyOrders = () => {
  const { currency, getToken, user } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/order/list", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setOrders(data.orders.reverse());
        setLoading(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      setLoading(false); // Ensure loading is stopped even on error
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  return (
    <>
      <Navbar />
      <div className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-screen">
        <div className="space-y-5">
          <h2 className="text-lg font-medium mt-6">My Orders</h2>
          {loading ? (
            <Loading />
          ) : orders.length === 0 ? (
            <p className="text-center">No orders found.</p>
          ) : (
            <div className="max-w-5xl border-t border-gray-300 text-sm">
              {orders.map((order, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row gap-5 justify-between p-5 border-b border-gray-300"
                >
                  <div className="flex-1 flex gap-5 max-w-80">
                    <Image
                      className="max-w-16 max-h-16 object-cover"
                      src={assets.box_icon}
                      alt="box_icon"
                    />
                    <p className="flex flex-col gap-3">
                      <span className="font-medium text-base">
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
                      <span>Method: {order.paymentType || 'COD'}</span>
                      <span>
                        Date: {new Date(order.date).toLocaleDateString()}
                      </span>
                      <span>Payment: {order.isPaid ? 'Paid' : 'Pending'}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyOrders;
