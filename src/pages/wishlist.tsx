"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

interface Product {
  _id: string;
  title: string;
  price: number;
  URL: string;
  SKU: string;
}

interface WishlistItem {
  _id: string;
  productId: Product;
  addedAt: string;
}

const API_GATEWAY_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:8000";

const WISHLIST_API = `${API_GATEWAY_URL}/api/wishlist`;
const PRODUCT_API = `${API_GATEWAY_URL}/api/catalogs`;
const FALLBACK_PRODUCT_API = `${API_GATEWAY_URL}/api/catalogs`;

const WishlistPage: React.FC = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const showLoginAlert = () => {
    Swal.fire({
      icon: "warning",
      title: "Login Required",
      text: "Please login to view your wishlist",
      confirmButtonText: "Login",
    }).then(() => {
      router.push("/profile?login=true");
    });
  };

  const fetchWishlist = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      showLoginAlert();
      return;
    }

    try {
      const res = await fetch(WISHLIST_API, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const detailedProducts: WishlistItem[] = await Promise.all(
        data.data.products.map(async (item: any) => {
          let prodData;

          try {
            const prodRes = await fetch(`${PRODUCT_API}/${item.productId}`, {
              credentials: "include",
            });
            prodData = await prodRes.json();
            if (!prodRes.ok) throw new Error();
          } catch {
            const prodRes2 = await fetch(
              `${FALLBACK_PRODUCT_API}/${item.productId}`,
              { credentials: "include" }
            );
            prodData = await prodRes2.json();
          }

          return { ...item, productId: prodData };
        })
      );

      setWishlist(detailedProducts);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to fetch wishlist",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      showLoginAlert();
      return;
    }

    try {
      const res = await fetch(`${WISHLIST_API}/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setWishlist((prev) =>
          prev.filter((item) => item.productId._id !== productId)
        );

        window.dispatchEvent(new CustomEvent("wishlistUpdated"));

        Swal.fire({
          icon: "success",
          title: "Removed",
          text: "Product removed from wishlist",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error.message || "Unable to remove item",
      });
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
              <h2 className="wishlist-title">
                {item.productId.title}
              </h2>
              <p className="wishlist-price">
                ₹{item.productId.price}
              </p>
              <p className="wishlist-sku">
                SKU: {item.productId.SKU}
              </p>
            </Link>

            <button
              className="wishlist-remove"
              onClick={() => handleRemove(item.productId._id)}
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
