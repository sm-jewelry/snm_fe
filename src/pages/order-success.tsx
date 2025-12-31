"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const OrderSuccessPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string>("");

  useEffect(() => {
    // Get order ID from URL if available
    const orderIdFromUrl = searchParams?.get("orderId");
    if (orderIdFromUrl) {
      setOrderId(orderIdFromUrl);
    }

    // Optional: clear any temporary cart/order data
    localStorage.removeItem("checkoutItem");

    // Dispatch cart update event to refresh cart count
    window.dispatchEvent(new Event("cartUpdated"));
  }, [searchParams]);

  return (
    <div className="order-success-page">
      <div className="order-success-background">
        <div className="success-sparkles">
          <span className="sparkle sparkle-1">✨</span>
          <span className="sparkle sparkle-2">✨</span>
          <span className="sparkle sparkle-3">✨</span>
          <span className="sparkle sparkle-4">✨</span>
          <span className="sparkle sparkle-5">✨</span>
          <span className="sparkle sparkle-6">✨</span>
        </div>

        <div className="order-success-container">
          {/* Success Icon Animation */}
          <div className="success-icon-wrapper">
            <div className="success-checkmark-circle">
              <div className="success-checkmark-stem"></div>
              <div className="success-checkmark-kick"></div>
            </div>
          </div>

          {/* Success Message */}
          <div className="success-content">
            <h1 className="success-title">Order Placed Successfully!</h1>
            <p className="success-subtitle">
              Thank you for your purchase from SNM Jewelry
            </p>

            {orderId && (
              <div className="order-id-badge">
                <span className="order-id-label">Order ID:</span>
                <span className="order-id-value">#{orderId.slice(-8)}</span>
              </div>
            )}

            <div className="success-message-box">
              <div className="success-message-item">
                <span className="message-icon">📧</span>
                <div>
                  <h3>Confirmation Email Sent</h3>
                  <p>We've sent order details to your registered email</p>
                </div>
              </div>
              <div className="success-message-item">
                <span className="message-icon">📦</span>
                <div>
                  <h3>Processing Your Order</h3>
                  <p>Your jewelry pieces are being prepared with care</p>
                </div>
              </div>
              <div className="success-message-item">
                <span className="message-icon">🚚</span>
                <div>
                  <h3>Shipping Updates</h3>
                  <p>You'll receive tracking information via email</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="success-actions">
              <button
                className="btn-primary btn-my-orders"
                onClick={() => router.push("/profile?tab=orders")}
              >
                <span className="btn-icon">📋</span>
                View My Orders
              </button>
              <Link href="/" className="btn-secondary btn-continue-shopping">
                <span className="btn-icon">🛍️</span>
                Continue Shopping
              </Link>
            </div>

            {/* Additional Info */}
            <div className="success-footer">
              <p>Need help? Contact us at <a href="mailto:support@snmjewelry.com">support@snmjewelry.com</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
