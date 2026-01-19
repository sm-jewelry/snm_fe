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
const CART_API = `${API_GATEWAY_URL}/api/cart`;

const WishlistPage: React.FC = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const router = useRouter();

  const showLoginAlert = () => {
    Swal.fire({
      icon: "warning",
      title: "Login Required",
      text: "Please login to view your wishlist",
      confirmButtonText: "Login",
      confirmButtonColor: "#FFD700",
    }).then(() => {
      router.push("/login");
    });
  };

  const fetchWishlist = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      showLoginAlert();
      setLoading(false);
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
            prodData = { _id: item.productId, title: "Product", price: 0, URL: "/placeholder.jpg", SKU: "" };
          }

          return { ...item, productId: prodData };
        })
      );

      setWishlist(detailedProducts);
    } catch (error: any) {
      console.error("Error fetching wishlist:", error);
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

    const result = await Swal.fire({
      title: "Remove from Wishlist?",
      text: "This item will be removed from your wishlist",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FFD700",
      cancelButtonColor: "#666",
      confirmButtonText: "Yes, remove",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${WISHLIST_API}/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      if (res.ok) {
        setWishlist((prev) =>
          prev.filter((item) => item.productId._id !== productId)
        );
        window.dispatchEvent(new CustomEvent("wishlistUpdated"));
        Swal.fire({
          icon: "success",
          title: "Removed",
          text: "Item removed from wishlist",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error.message || "Unable to remove item",
      });
    }
  };

  const handleAddToCart = async (product: Product) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      showLoginAlert();
      return;
    }

    setAddingToCart(product._id);

    try {
      const res = await fetch(`${CART_API}/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
          price: product.price,
          title: product.title,
          url: product.URL,
        }),
      });

      if (res.ok) {
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        Swal.fire({
          icon: "success",
          title: "Added to Cart",
          text: `${product.title} has been added to your cart`,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error.message || "Unable to add to cart",
      });
    } finally {
      setAddingToCart(null);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  if (loading) {
    return (
      <div className="wishlist-loading">
        <div className="loading-spinner"></div>
        <p>Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      {/* Page Header */}
      <div className="wishlist-header">
        <h1>My Wishlist</h1>
        {wishlist.length > 0 && (
          <p className="wishlist-count">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}</p>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="wishlist-empty">
          <div className="wishlist-empty-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <h2>Your wishlist is empty</h2>
          <p>Save items you love by tapping the heart icon</p>
          <Link href="/shop" className="wishlist-empty-btn">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="wishlist-content">
          <div className="wishlist-grid">
            {wishlist.map((item) => (
              <div key={item._id} className="wishlist-card">
                {/* Remove Button */}
                <button
                  className="wishlist-remove-btn"
                  onClick={() => handleRemove(item.productId._id)}
                  aria-label="Remove from wishlist"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>

                {/* Product Image */}
                <Link href={`/products/${item.productId._id}`} className="wishlist-image">
                  <img
                    src={item.productId.URL || "/placeholder.jpg"}
                    alt={item.productId.title}
                  />
                </Link>

                {/* Product Info */}
                <div className="wishlist-info">
                  <Link href={`/products/${item.productId._id}`} className="wishlist-title">
                    {item.productId.title}
                  </Link>
                  <p className="wishlist-price">
                    Rs.{item.productId.price?.toLocaleString() || 0}
                  </p>
                  {item.productId.SKU && (
                    <p className="wishlist-sku">SKU: {item.productId.SKU}</p>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button
                  className="wishlist-add-cart"
                  onClick={() => handleAddToCart(item.productId)}
                  disabled={addingToCart === item.productId._id}
                >
                  {addingToCart === item.productId._id ? (
                    <span className="btn-loading"></span>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .wishlist-page {
          min-height: 100vh;
          background: #f8f8f8;
          padding-bottom: 100px;
        }

        .wishlist-header {
          padding: 24px 20px;
          background: #fff;
          border-bottom: 1px solid #eee;
        }

        .wishlist-header h1 {
          font-size: 24px;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0 0 4px;
          font-family: "Playfair Display", Georgia, serif;
        }

        .wishlist-count {
          font-size: 14px;
          color: #666;
          margin: 0;
        }

        /* Loading */
        .wishlist-loading {
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f0f0f0;
          border-top-color: #FFD700;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Empty State */
        .wishlist-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
          min-height: 50vh;
        }

        .wishlist-empty-icon {
          color: #ddd;
          margin-bottom: 24px;
        }

        .wishlist-empty h2 {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 8px;
        }

        .wishlist-empty p {
          font-size: 14px;
          color: #666;
          margin: 0 0 24px;
        }

        .wishlist-empty-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 32px;
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          color: #000;
          font-size: 15px;
          font-weight: 700;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .wishlist-empty-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 215, 0, 0.4);
        }

        /* Content */
        .wishlist-content {
          padding: 16px;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Grid */
        .wishlist-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        /* Card */
        .wishlist-card {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .wishlist-remove-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.95);
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          color: #666;
        }

        .wishlist-remove-btn:hover {
          background: #ef4444;
          color: #fff;
        }

        .wishlist-image {
          display: block;
          aspect-ratio: 1;
          overflow: hidden;
        }

        .wishlist-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .wishlist-card:hover .wishlist-image img {
          transform: scale(1.05);
        }

        .wishlist-info {
          padding: 12px;
          flex: 1;
        }

        .wishlist-title {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          text-decoration: none;
          margin-bottom: 4px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.3;
        }

        .wishlist-price {
          font-size: 16px;
          font-weight: 700;
          color: #FFA500;
          margin: 0 0 4px;
        }

        .wishlist-sku {
          font-size: 11px;
          color: #999;
          margin: 0;
        }

        .wishlist-add-cart {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: calc(100% - 24px);
          margin: 0 12px 12px;
          padding: 12px;
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          color: #000;
          font-size: 13px;
          font-weight: 700;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .wishlist-add-cart:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
        }

        .wishlist-add-cart:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-loading {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(0, 0, 0, 0.2);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Tablet */
        @media (min-width: 600px) {
          .wishlist-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }

          .wishlist-content {
            padding: 24px;
          }
        }

        /* Desktop */
        @media (min-width: 1024px) {
          .wishlist-page {
            padding-bottom: 40px;
          }

          .wishlist-header {
            padding: 32px 40px;
          }

          .wishlist-header h1 {
            font-size: 32px;
          }

          .wishlist-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
          }

          .wishlist-content {
            padding: 24px 40px;
          }

          .wishlist-card {
            border-radius: 16px;
          }

          .wishlist-title {
            font-size: 15px;
          }

          .wishlist-price {
            font-size: 18px;
          }

          .wishlist-add-cart {
            padding: 14px;
            font-size: 14px;
          }
        }

        /* Large Desktop */
        @media (min-width: 1400px) {
          .wishlist-grid {
            grid-template-columns: repeat(5, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default WishlistPage;
