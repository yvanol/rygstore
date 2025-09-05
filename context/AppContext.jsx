"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = (props) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY;
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchProductData = async () => {
    try {
      const { data } = await axios.get("/api/product/list");
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  

 const addToCart = async (itemId) => {
  if (!itemId) {
    toast.error("Invalid item ID");
    return;
  }

  const productExists = products.find((product) => product._id === itemId);
  if (!productExists) {
    toast.error("Product not found");
    return;
  }

  let cartData = structuredClone(cartItems || {});
  if (cartData[itemId]) {
    cartData[itemId] += 1;
  } else {
    cartData[itemId] = 1;
  }

  setCartItems(cartData);
  if (user) {
    try {
      const token = await getToken();
      console.log('Sending cartData:', cartData);
      const response = await axios.post(
        "/api/cart/update",
        { cartData },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        toast.success("Item added to cart");
      } else {
        toast.error(response.data.message);
        setCartItems(cartItems); // Revert state on failure
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error(error.response?.data?.message || "Failed to add item to cart");
      setCartItems(cartItems); // Revert state on failure
    }
  } else {
    toast.success("Item added to cart (local)");
  }
};

const fetchUserData = async () => {
  try {
    if (user?.publicMetadata.role === "seller") {
      setIsSeller(true);
    }

    const token = await getToken();
    const { data } = await axios.get("/api/user/data", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Fetched user data:', data); // Log for debugging
    if (data.success) {
      setUserData(data.user);
      setCartItems(data.user.cartItems || {}); // cartItems is mapped from cartItem
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    console.error('Fetch user data error:', error);
    toast.error(error.message);
  }
};

  const updateCartQuantity = async (itemId, quantity) => {
    if (!itemId) {
      toast.error("Invalid item ID");
      return;
    }

    let cartData = structuredClone(cartItems || {});
    if (quantity === 0) {
      delete cartData[itemId];
    } else {
      cartData[itemId] = quantity;
    }
    setCartItems(cartData);
    if (user) {
      try {
        const token = await getToken();
        await axios.post(
          "/api/cart/update",
          { cartData },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success("Cart updated successfully");
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      if (cartItems[items] > 0) {
        totalCount += cartItems[items];
      }
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      if (itemInfo && cartItems[items] > 0) {
        totalAmount += itemInfo.offerPrice * cartItems[items];
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };

  useEffect(() => {
    fetchProductData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const value = {
    getToken,
    currency,
    router,
    isSeller,
    setIsSeller,
    userData,
    fetchUserData,
    products,
    fetchProductData,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    getCartAmount,
    user,
    isLoading,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
