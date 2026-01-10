"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

// ✅ Use API Gateway URL
const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

const CartPage = () => {
  const [cart, setCart] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch(`${API_GATEWAY_URL}/api/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include', // Important for API Gateway
    })
      .then((res) => res.json())
      .then((data) => setCart(data.data))
      .catch((err) => console.error("Error fetching cart:", err));
  }, []);

  if (!cart) return <p className="loading-text">Loading cart...</p>;

  const handleCheckout = () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Cart Empty",
        text: "Your cart is empty!",
        confirmButtonText: "OK",
      });

      return;
    }
    router.push(`/checkout?cartId=${cart._id}`);
  };

  const cartTotal = cart.items.reduce(
    (sum: number, i: any) => sum + i.price * i.quantity,
    0
  );

  return (
    <div className="cart-container" style={{ padding: "20px" }}>
      <h1 className="cart-title">Your Cart</h1>

      {cart.items.length === 0 ? (
        <p className="empty-cart">No items in cart</p>
      ) : (
        <>
          <ul className="cart-items" style={{ listStyle: "none", padding: 0 }}>
            {cart.items.map((item: any) => (
              <li
                key={item.productId}
                className="cart-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  borderBottom: "1px solid #eee",
                  padding: "10px 0",
                }}
              >
                {item.url && (
                  <div
                    style={{ width: "60px", height: "60px", flexShrink: 0 }}
                  >
                    <img
                      src={item.url}
                      alt={item.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      margin: "0 0 5px",
                      fontWeight: "bold",
                    }}
                  >
                    {item.title}
                  </p>
                  <p style={{ margin: "0 0 5px" }}>₹{item.price}</p>
                  <p style={{ margin: 0 }}>Qty: {item.quantity}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="cart-footer" style={{ marginTop: "20px" }}>
            <p>
              <strong>Total:</strong> ₹{cartTotal}
            </p>
            <button
              onClick={handleCheckout}
              className="checkout-btn"
              style={{
                padding: "10px 20px",
                background: "#0070f3",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;