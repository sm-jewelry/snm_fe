"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Product {
  _id: string;
  title: string;
  price: number;
  URL: string;
  SKU: string;
}

interface WishlistItem {
  _id: string; // wishlist item ID
  productId: Product;
  addedAt: string;
}

// ✅ Use environment variables instead of hardcoded URLs
const WISHLIST_API = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/wishlist`;
const PRODUCT_API = `${process.env.NEXT_PUBLIC_CATEGORY_API_BASE_URL}/api/catalogs`;
const FALLBACK_PRODUCT_API = `${process.env.NEXT_PUBLIC_CATEGORY_API_BASE_URL}/api/products`;

const WishlistPage: React.FC = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchWishlist = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/profile");
      return;
    }

    try {
      const res = await fetch(WISHLIST_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch wishlist");

      // Fetch product details for each wishlist item
      const detailedProducts: WishlistItem[] = await Promise.all(
        data.data.products.map(async (item: any) => {
          let prodData = null;
          try {
            // Try first endpoint
            const prodRes = await fetch(`${PRODUCT_API}/${item.productId}`);
            prodData = await prodRes.json();
            if (!prodRes.ok || !prodData._id) throw new Error("Not found");
          } catch {
            // Try fallback endpoint
            const prodRes2 = await fetch(`${FALLBACK_PRODUCT_API}/${item.productId}`);
            prodData = await prodRes2.json();
          }

          return {
            ...item,
            productId: prodData,
          };
        })
      );

      setWishlist(detailedProducts);
    } catch (err) {
      console.error(err);
      alert("Something went wrong while fetching wishlist.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const res = await fetch(`${WISHLIST_API}/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        // Remove item locally
        setWishlist((prev) => prev.filter((item) => item.productId._id !== productId));
        window.dispatchEvent(new CustomEvent("wishlistUpdated"));
      } else {
        alert(data.message || "Failed to remove from wishlist");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while removing item.");
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  if (loading) return <p>Loading wishlist...</p>;
  if (wishlist.length === 0)
    return <p>Your wishlist is empty. Start adding some products!</p>;

  return (
    <section className="wishlist-page">
      <div className="wishlist-hero">
        <h1>Your Wishlist</h1>
      </div>

      <div className="wishlist-grid">
        {wishlist.map((item) => (
          <div key={item._id} className="wishlist-card">
            <Link href={`/products/${item.productId._id}`}>
              <img
                src={item.productId.URL}
                alt={item.productId.title}
                className="wishlist-img"
              />
              <h2 className="wishlist-title">{item.productId.title}</h2>
              <p className="wishlist-price">₹{item.productId.price}</p>
              <p className="wishlist-sku">SKU: {item.productId.SKU}</p>
            </Link>

            <button
              className="wishlist-remove"
              onClick={() => handleRemove(item.productId._id)}
              title="Remove from Wishlist"
            >
              ❌
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WishlistPage;
