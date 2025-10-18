"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// ✅ Use environment variable instead of hardcoded URL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const [cart, setCart] = useState<any>(null);
  const router = useRouter();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  // ✅ Fetch cart items
  const fetchCart = () => {
    if (!token) return;
    fetch(`${API_BASE}/api/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCart(data.data))
      .catch((err) => console.error("Error fetching cart:", err));
  };

  useEffect(() => {
    if (isOpen) fetchCart();
  }, [isOpen]);

  // ✅ Update quantity
  const updateQuantity = async (productId: string, quantity: number) => {
    if (!token) return;
    try {
      await fetch(`${API_BASE}/api/cart/item/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });
      fetchCart();
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  // ✅ Remove item
  const removeItem = async (productId: string) => {
    if (!token) return;
    try {
      await fetch(`${API_BASE}/api/cart/item/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  // ✅ Checkout
  const handleCheckout = () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    router.push(`/checkout?cartId=${cart._id}`);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`cart-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`cart-drawer ${isOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button onClick={onClose} className="cart-close">
            ✕
          </button>
        </div>

        <div className="cart-items-wrapper">
          {!cart ? (
            <p>Loading...</p>
          ) : cart.items.length === 0 ? (
            <p>No items in cart</p>
          ) : (
            cart.items.map((item: any) => (
              <div
                key={item.productId}
                className="cart-item flex items-center justify-between gap-2"
              >
                {item.url && (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="cart-item-info flex-1 ml-2">
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm">₹{item.price}</p>
                  <div className="cart-item-qty flex items-center gap-2 mt-1">
                    <button
                      className="px-2 py-1 border rounded"
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.quantity - 1 > 0 ? item.quantity - 1 : 1
                        )
                      }
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      className="px-2 py-1 border rounded"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Remove item"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        {cart && (
          <div className="cart-footer mt-4">
            <div className="cart-subtotal flex justify-between font-medium mb-2">
              <span>Subtotal:</span>
              <span>₹{cart.total}</span>
            </div>

            <Link
              href="/cart"
              onClick={onClose}
              className="view-cart-btn block mb-2 text-center bg-gray-200 py-2 rounded"
            >
              View Cart
            </Link>

            <button
              className="checkout-btn w-full bg-black text-white py-2 rounded"
              onClick={handleCheckout}
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
