// app/search/SearchClient.jsx
"use client";
import { useAppContext } from "@/context/AppContext";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard"; // Adjust path as needed
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SearchClient = () => {
  const { products } = useAppContext();
  const searchParams = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Memoize query and productIds to prevent unnecessary re-renders
  const query = useMemo(() => searchParams.get("q")?.toLowerCase() || "", [searchParams]);
  const productIds = useMemo(() => {
    const ids = searchParams.get("products")?.split(",") || [];
    return ids.filter((id) => id); // Remove empty IDs
  }, [searchParams]);

  useEffect(() => {
    if (!products.length) return;

    // Filter products based on query or productIds
    const results = products.filter((product) => {
      // Check if product matches query
      const matchesQuery = query
        ? [product.name, product.description, product.category].some((field) =>
            field?.toLowerCase().includes(query)
          )
        : true; // If no query, include all products in productIds
      // Check if product is in productIds (if provided)
      const matchesIds = productIds.length ? productIds.includes(product._id) : true;
      return matchesQuery && matchesIds;
    });

    setFilteredProducts(results);
  }, [products, query, productIds]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow p-6 flex justify-center">
        <div className="w-full max-w-7xl">
          <h1 className="text-2xl font-bold mb-4 text-center">
            Search Results for "{query || "All Products"}"
          </h1>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center">No products found.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchClient;