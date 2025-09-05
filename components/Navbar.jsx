// In Navbar.jsx
"use client";
import React, { useState } from "react";
import { assets, BagIcon, BoxIcon, CartIcon, HomeIcon } from "@/assets/assets";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { useClerk, UserButton } from "@clerk/nextjs";

const Navbar = () => {
  const { isSeller, router, user, products } = useAppContext(); // Add products
  const { openSignIn } = useClerk();
  const [searchQuery, setSearchQuery] = useState("");

  const whatsappNumber = "237655372422";
  const whatsappMessage = encodeURIComponent("Hello, I have a question about your store!");
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

 const handleSearch = async (e) => {
  e.preventDefault();
  if (searchQuery.trim()) {
    try {
      const response = await fetch(`/api/product/search?q=${encodeURIComponent(searchQuery)}`);
      const { success, products } = await response.json();
      if (success) {
        const productIds = products.map((p) => p._id).join(",");
        router.push(`/search?q=${encodeURIComponent(searchQuery)}&products=${encodeURIComponent(productIds)}`);
      } else {
        console.error("Search failed:", products.message);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  }
};

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700">
      <Image
        className="cursor-pointer w-28 md:w-32"
        onClick={() => router.push("/")}
        src={assets.logo}
        alt="logo"
      />
      <div className="flex items-center gap-4 lg:gap-8 max-md:hidden">
        <Link href="/" className="hover:text-gray-900 transition">
          Home
        </Link>
        <Link href="/all-products" className="hover:text-gray-900 transition">
          Shop
        </Link>
        <Link href="/" className="hover:text-gray-900 transition">
          About Us
        </Link>
        <Link href={whatsappLink} className="hover:text-gray-900 transition">
          Contact
        </Link>

        {isSeller && (
          <button
            onClick={() => router.push("/seller")}
            className="text-xs border px-4 py-1.5 rounded-full"
          >
            Seller Dashboard
          </button>
        )}
      </div>

      <ul className="hidden md:flex items-center gap-4">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="border border-gray-300 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
          />
          <button type="submit">
            <Image className="w-4 h-4" src={assets.search_icon} alt="search icon" />
          </button>
        </form>
        {user ? (
          <>
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action label="Home" labelIcon={<HomeIcon />} onClick={() => router.push("/")} />
              </UserButton.MenuItems>
              <UserButton.MenuItems>
                <UserButton.Action label="Product" labelIcon={<BoxIcon />} onClick={() => router.push("/all-products")} />
              </UserButton.MenuItems>
              <UserButton.MenuItems>
                <UserButton.Action label="Cart" labelIcon={<CartIcon />} onClick={() => router.push("/cart")} />
              </UserButton.MenuItems>
              <UserButton.MenuItems>
                <UserButton.Action label="My Orders" labelIcon={<BagIcon />} onClick={() => router.push("/my-orders")} />
              </UserButton.MenuItems>
            </UserButton>
          </>
        ) : (
          <button
            onClick={openSignIn}
            className="flex items-center gap-2 hover:text-gray-900 transition"
          >
            <Image src={assets.user_icon} alt="user icon" />
            Account
          </button>
        )}
      </ul>

      <div className="flex items-center md:hidden gap-3">
        {isSeller && (
          <button
            onClick={() => router.push("/seller")}
            className="text-xs border px-4 py-1.5 rounded-full"
          >
            Seller Dashboard
          </button>
        )}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="border border-gray-300 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
          />
          <button type="submit">
            <Image className="w-4 h-4" src={assets.search_icon} alt="search icon" />
          </button>
        </form>
        {user ? (
          <>
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action label="Home" labelIcon={<HomeIcon />} onClick={() => router.push("/")} />
              </UserButton.MenuItems>
              <UserButton.MenuItems>
                <UserButton.Action label="Product" labelIcon={<BoxIcon />} onClick={() => router.push("/all-products")} />
              </UserButton.MenuItems>
              <UserButton.MenuItems>
                <UserButton.Action label="Cart" labelIcon={<CartIcon />} onClick={() => router.push("/cart")} />
              </UserButton.MenuItems>
              <UserButton.MenuItems>
                <UserButton.Action label="My Orders" labelIcon={<BagIcon />} onClick={() => router.push("/my-orders")} />
              </UserButton.MenuItems>
            </UserButton>
          </>
        ) : (
          <button
            onClick={openSignIn}
            className="flex items-center gap-2 hover:text-gray-900 transition"
          >
            <Image src={assets.user_icon} alt="user icon" />
            Account
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;