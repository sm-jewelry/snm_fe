import React, { useEffect } from "react";
import { useRouter } from "next/router";

const OrderSuccessPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Optional: clear any temporary cart/order data
    localStorage.removeItem("checkoutItem");
  }, []);

  return (
    <div className="order-success-page">
      <div className="order-success-container">
        <div className="success-icon">✔</div>
        <h1>Thank You for Your Order!</h1>
        <p>Your order has been placed successfully.</p>
        <p>We’ll send you a confirmation email with your order details shortly.</p>

        <button
          className="view-orders-btn"
          onClick={() => router.push("/my-orders")}
        >
          View My Orders
        </button>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
