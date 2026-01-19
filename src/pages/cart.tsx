"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Link from "next/link";

interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  url?: string;
}

interface Cart {
  _id: string;
  items: CartItem[];
}

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

const CartPage = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCart = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_GATEWAY_URL}/api/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        setCart(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching cart:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (productId: string, newQuantity: number) => {
    const token = localStorage.getItem("access_token");
    if (!token || newQuantity < 1) return;

    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/cart/item/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (res.ok) {
        fetchCart();
        window.dispatchEvent(new CustomEvent("cartUpdated"));
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const removeItem = async (productId: string) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const result = await Swal.fire({
      title: "Remove Item?",
      text: "Are you sure you want to remove this item from your cart?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FFD700",
      cancelButtonColor: "#666",
      confirmButtonText: "Yes, remove it",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/cart/item/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (res.ok) {
        fetchCart();
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        Swal.fire({
          icon: "success",
          title: "Removed",
          text: "Item removed from cart",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  const handleCheckout = () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Cart Empty",
        text: "Your cart is empty!",
        confirmButtonText: "OK",
        confirmButtonColor: "#FFD700",
      });
      return;
    }
    router.push(`/checkout?cartId=${cart._id}`);
  };

  if (loading) {
    return (
      <div className="cart-page-loading">
        <div className="loading-spinner"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  const cartTotal = cart?.items?.reduce(
    (sum: number, item: CartItem) => sum + item.price * item.quantity,
    0
  ) || 0;

  const cartItemCount = cart?.items?.reduce(
    (sum: number, item: CartItem) => sum + item.quantity,
    0
  ) || 0;

  return (
    <div className="cart-page">
      {/* Page Header */}
      <div className="cart-page-header">
        <h1>Shopping Cart</h1>
        {cart && cart.items && cart.items.length > 0 && (
          <p className="cart-count">{cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}</p>
        )}
      </div>

      {!cart || !cart.items || cart.items.length === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any jewelry yet</p>
          <Link href="/shop" className="cart-empty-btn">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-content">
          {/* Cart Items */}
          <div className="cart-items-section">
            {cart.items.map((item: CartItem) => (
              <div key={item.productId} className="cart-item-card">
                <Link href={`/products/${item.productId}`} className="cart-item-image">
                  <img
                    src={item.url || "/placeholder.jpg"}
                    alt={item.title}
                  />
                </Link>

                <div className="cart-item-details">
                  <Link href={`/products/${item.productId}`} className="cart-item-title">
                    {item.title}
                  </Link>
                  <p className="cart-item-price">
                    <span className="price-value">Rs.{item.price.toLocaleString()}</span>
                  </p>

                  <div className="cart-item-actions">
                    <div className="quantity-control">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                    </div>

                    <button
                      className="remove-btn"
                      onClick={() => removeItem(item.productId)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      <span className="remove-text">Remove</span>
                    </button>
                  </div>
                </div>

                <div className="cart-item-subtotal">
                  <span className="subtotal-label">Subtotal</span>
                  <span className="subtotal-value">Rs.{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary - Desktop */}
          <div className="cart-summary-desktop">
            <div className="summary-card">
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Subtotal ({cartItemCount} items)</span>
                <span>Rs.{cartTotal.toLocaleString()}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span className="free-shipping">FREE</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total">
                <span>Total</span>
                <span>Rs.{cartTotal.toLocaleString()}</span>
              </div>

              <button className="checkout-btn" onClick={handleCheckout}>
                Proceed to Checkout
              </button>

              <Link href="/shop" className="continue-shopping">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Continue Shopping
              </Link>

              <div className="trust-badges">
                <div className="trust-badge">
                  <span>🔒</span>
                  <span>Secure Payment</span>
                </div>
                <div className="trust-badge">
                  <span>🚚</span>
                  <span>Free Shipping</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Mobile Footer */}
      {cart && cart.items && cart.items.length > 0 && (
        <div className="cart-mobile-footer">
          <div className="mobile-footer-content">
            <div className="mobile-total">
              <span className="mobile-total-label">Total</span>
              <span className="mobile-total-value">Rs.{cartTotal.toLocaleString()}</span>
            </div>
            <button className="mobile-checkout-btn" onClick={handleCheckout}>
              Checkout
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .cart-page {
          min-height: 100vh;
          background: #f8f8f8;
          padding-bottom: 100px;
        }

        .cart-page-header {
          padding: 24px 20px;
          background: #fff;
          border-bottom: 1px solid #eee;
        }

        .cart-page-header h1 {
          font-size: 24px;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0 0 4px;
          font-family: "Playfair Display", Georgia, serif;
        }

        .cart-count {
          font-size: 14px;
          color: #666;
          margin: 0;
        }

        /* Loading State */
        .cart-page-loading {
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

        /* Empty Cart */
        .cart-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
          min-height: 50vh;
        }

        .cart-empty-icon {
          color: #ddd;
          margin-bottom: 24px;
        }

        .cart-empty h2 {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 8px;
        }

        .cart-empty p {
          font-size: 14px;
          color: #666;
          margin: 0 0 24px;
        }

        .cart-empty-btn {
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

        .cart-empty-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 215, 0, 0.4);
        }

        /* Cart Content */
        .cart-content {
          display: flex;
          gap: 24px;
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .cart-items-section {
          flex: 1;
        }

        /* Cart Item Card */
        .cart-item-card {
          display: flex;
          gap: 16px;
          background: #fff;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .cart-item-image {
          flex-shrink: 0;
        }

        .cart-item-image img {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 8px;
        }

        .cart-item-details {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .cart-item-title {
          font-size: 15px;
          font-weight: 600;
          color: #1a1a1a;
          text-decoration: none;
          margin-bottom: 4px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .cart-item-price {
          margin: 0 0 12px;
        }

        .price-value {
          font-size: 18px;
          font-weight: 700;
          color: #FFA500;
        }

        .cart-item-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: auto;
        }

        .quantity-control {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f5f5f5;
          border-radius: 8px;
          padding: 4px;
        }

        .qty-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #1a1a1a;
        }

        .qty-btn:hover:not(:disabled) {
          background: #FFD700;
        }

        .qty-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .qty-value {
          min-width: 32px;
          text-align: center;
          font-weight: 700;
          font-size: 15px;
        }

        .remove-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          color: #ef4444;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .remove-btn:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .cart-item-subtotal {
          display: none;
          flex-direction: column;
          align-items: flex-end;
          justify-content: center;
          min-width: 100px;
        }

        .subtotal-label {
          font-size: 12px;
          color: #999;
        }

        .subtotal-value {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
        }

        /* Desktop Summary */
        .cart-summary-desktop {
          width: 360px;
          flex-shrink: 0;
        }

        .summary-card {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          position: sticky;
          top: 100px;
        }

        .summary-card h2 {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 20px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          font-size: 15px;
          color: #666;
        }

        .summary-row.total {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .free-shipping {
          color: #10b981;
          font-weight: 600;
        }

        .summary-divider {
          height: 1px;
          background: #eee;
          margin: 8px 0;
        }

        .checkout-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          color: #000;
          font-size: 16px;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          margin-top: 20px;
          transition: all 0.2s ease;
        }

        .checkout-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 215, 0, 0.4);
        }

        .continue-shopping {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #666;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          margin-top: 16px;
          padding: 12px;
          transition: color 0.2s ease;
        }

        .continue-shopping:hover {
          color: #FFA500;
        }

        .trust-badges {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }

        .trust-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #666;
        }

        /* Mobile Footer */
        .cart-mobile-footer {
          display: none;
          position: fixed;
          bottom: 65px;
          left: 0;
          right: 0;
          background: #fff;
          padding: 16px 20px;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
          z-index: 100;
        }

        .mobile-footer-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .mobile-total {
          flex: 1;
        }

        .mobile-total-label {
          display: block;
          font-size: 12px;
          color: #666;
        }

        .mobile-total-value {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .mobile-checkout-btn {
          flex: 1;
          padding: 16px 32px;
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          color: #000;
          font-size: 15px;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          cursor: pointer;
        }

        /* Tablet & Desktop */
        @media (min-width: 769px) {
          .cart-page {
            padding-bottom: 40px;
          }

          .cart-page-header {
            padding: 32px 40px;
          }

          .cart-page-header h1 {
            font-size: 32px;
          }

          .cart-content {
            padding: 24px 40px;
          }

          .cart-item-card {
            padding: 20px;
          }

          .cart-item-image img {
            width: 120px;
            height: 120px;
          }

          .cart-item-subtotal {
            display: flex;
          }

          .remove-text {
            display: inline;
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .cart-page {
            padding-bottom: 140px;
          }

          .cart-content {
            flex-direction: column;
            padding: 12px;
          }

          .cart-summary-desktop {
            display: none;
          }

          .cart-mobile-footer {
            display: block;
          }

          .cart-item-card {
            padding: 12px;
          }

          .cart-item-image img {
            width: 80px;
            height: 80px;
          }

          .cart-item-title {
            font-size: 14px;
          }

          .price-value {
            font-size: 16px;
          }

          .remove-text {
            display: none;
          }

          .cart-item-actions {
            gap: 12px;
          }

          .qty-btn {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>
    </div>
  );
};

export default CartPage;
