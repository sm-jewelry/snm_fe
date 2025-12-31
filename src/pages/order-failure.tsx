"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const OrderFailurePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string>("");
  const [errorReason, setErrorReason] = useState<string>("");

  useEffect(() => {
    // Get order ID and error reason from URL if available
    const orderIdFromUrl = searchParams?.get("orderId");
    const reasonFromUrl = searchParams?.get("reason");

    if (orderIdFromUrl) {
      setOrderId(orderIdFromUrl);
    }

    if (reasonFromUrl) {
      setErrorReason(reasonFromUrl);
    }
  }, [searchParams]);

  return (
    <div className="order-failure-page">
      <div className="order-failure-background">
        {/* Floating error symbols */}
        <div className="failure-symbols">
          <span className="error-symbol error-symbol-1">⚠️</span>
          <span className="error-symbol error-symbol-2">⚠️</span>
          <span className="error-symbol error-symbol-3">⚠️</span>
          <span className="error-symbol error-symbol-4">⚠️</span>
        </div>

        <div className="order-failure-container">
          {/* Failure Icon Animation */}
          <div className="failure-icon-wrapper">
            <div className="failure-cross-circle">
              <div className="failure-cross-line1"></div>
              <div className="failure-cross-line2"></div>
            </div>
          </div>

          {/* Failure Message */}
          <div className="failure-content">
            <h1 className="failure-title">Payment Failed</h1>
            <p className="failure-subtitle">
              We couldn't process your payment. Don't worry, no charges were made.
            </p>

            {orderId && (
              <div className="failure-order-info">
                <p className="failure-order-label">Order Reference:</p>
                <p className="failure-order-id">{orderId}</p>
              </div>
            )}

            {errorReason && (
              <div className="failure-reason-box">
                <p className="failure-reason-label">Reason:</p>
                <p className="failure-reason-text">{errorReason}</p>
              </div>
            )}

            {/* Common Reasons */}
            <div className="failure-common-reasons">
              <h3>Common Reasons for Payment Failure:</h3>
              <ul>
                <li>Insufficient balance in account</li>
                <li>Incorrect card details or CVV</li>
                <li>Card expired or blocked</li>
                <li>Network connection issue</li>
                <li>Payment was cancelled by you</li>
                <li>Bank declined the transaction</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="failure-actions">
              <button
                onClick={() => router.push('/checkout')}
                className="failure-btn-primary"
              >
                <span className="btn-icon">🔄</span>
                Retry Payment
              </button>

              <Link href="/cart" className="failure-btn-secondary">
                <span className="btn-icon">🛒</span>
                Return to Cart
              </Link>

              <Link href="/shop" className="failure-btn-tertiary">
                <span className="btn-icon">🏪</span>
                Continue Shopping
              </Link>
            </div>

            {/* Help Section */}
            <div className="failure-help-section">
              <div className="help-card">
                <h4>Need Help?</h4>
                <p>If you continue to face issues, please try:</p>
                <ul>
                  <li>Use a different payment method</li>
                  <li>Check with your bank</li>
                  <li>Contact our support team</li>
                </ul>
                <Link href="/contact" className="help-link">
                  Contact Support →
                </Link>
              </div>

              <div className="help-card">
                <h4>Alternative Payment Methods</h4>
                <p>You can also pay using:</p>
                <ul>
                  <li>UPI (PhonePe, GPay, Paytm)</li>
                  <li>Net Banking</li>
                  <li>Cash on Delivery (COD)</li>
                  <li>Different Card</li>
                </ul>
              </div>
            </div>

            {/* Footer Info */}
            <div className="failure-footer">
              <p className="failure-assurance">
                <span className="shield-icon">🛡️</span>
                Your payment information is always secure with us
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderFailurePage;
