"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface Product {
  _id: string;
  title: string;
  price: number;
  stock: number;
  SKU: string;
  URL: string;
  images?: string[];
  oldPrice?: number;
  colors?: string[];
  sizes?: string[];
}

const CATEGORY_API = process.env.NEXT_PUBLIC_CATEGORY_API_BASE_URL;
const MAIN_API = process.env.NEXT_PUBLIC_API_BASE_URL;

const CollectionProductsPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [products, setProducts] = useState<Product[]>([]);
  const [collectionName, setCollectionName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Fetch collection details
        const colRes = await fetch(`${CATEGORY_API}/api/collections/${id}`);
        const colData = await colRes.json();
        setCollectionName(colData.name || "Collection");

        // Fetch products in collection
        const res = await fetch(`${CATEGORY_API}/api/products/collection/${id}`);
        const data = await res.json();
        setProducts(data || []);
      } catch (err) {
        console.error("Error fetching collection products:", err);
        alert("Failed to fetch collection products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [id]);

  const handleAddToCart = async (product: Product) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Please login to continue");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${MAIN_API}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          url: product.URL,
          title: product.title,
          price: product.price,
          quantity: 1,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Product added to cart successfully!");
        window.dispatchEvent(new CustomEvent("cartUpdated"));
      } else {
        alert(data.message || "❌ Failed to add to cart");
      }
    } catch (err) {
      console.error("Cart Add Error:", err);
      alert("Something went wrong while adding to cart.");
    }
  };

  const handleAddToWishlist = async (product: Product) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Please login to continue");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${MAIN_API}/api/wishlist/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product._id }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Added to wishlist!");
        window.dispatchEvent(new CustomEvent("wishlistUpdated"));
      } else {
        alert(data.message || "❌ Failed to add to wishlist");
      }
    } catch (err) {
      console.error("Wishlist Error:", err);
      alert("Something went wrong adding to wishlist.");
    }
  };

  if (loading)
    return <p className="text-center p-6">Loading collection products...</p>;

  if (!products.length)
    return (
      <p className="text-center p-6">
        No products found in "{collectionName}" collection.
      </p>
    );

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        {collectionName} Products
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product._id} className="product-card border rounded-lg overflow-hidden">
            <div className="relative">
              <Link href={`/products/${product._id}`}>
                <img
                  src={product.URL}
                  alt={product.title}
                  className="w-full h-64 object-cover"
                />
              </Link>
              <div className="absolute top-2 right-2 flex flex-col gap-2">
                <button
                  className="bg-white p-1 rounded-full shadow-md"
                  title="Add to Wishlist"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddToWishlist(product);
                  }}
                >
                  ❤️
                </button>
                <button
                  className="bg-white p-1 rounded-full shadow-md"
                  title="Add to Cart"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddToCart(product);
                  }}
                >
                  🛒
                </button>
              </div>
            </div>
            <div className="p-3">
              <Link href={`/products/${product._id}`}>
                <h3 className="font-semibold mb-1">{product.title}</h3>
                <p className="text-black font-bold">₹{product.price}</p>
                <p className="text-gray-500 text-sm">SKU: {product.SKU}</p>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CollectionProductsPage;
