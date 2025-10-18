"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  amount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

// ✅ Use environment variable for API base URL
const API_BASE = `${process.env.NEXT_PUBLIC_ORDER_API_BASE_URL}/api/orders`;

const MyOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setError("Please log in to view your orders.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch orders");
        setOrders(data.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="orders-loading">Loading your orders...</div>;
  if (error) return <div className="orders-error">{error}</div>;

  if (orders.length === 0) {
    return (
      <div className="my-orders-page">
        <h1>My Orders</h1>
        <p>You haven’t placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <h1>My Orders</h1>

      <div className="orders-list">
        {orders.map((order) => (
          <Link href={`/my-orders/${order._id}`} key={order._id} className="order-link">
            <div className="order-card">
              <div className="order-header">
                <div>
                  <strong>Order ID:</strong> {order._id}
                </div>
                <div className={`order-status ${order.status}`}>
                  {order.status.toUpperCase()}
                </div>
              </div>

              <div className="order-items">
                {order.items.map((item, i) => (
                  <div key={i} className="order-item">
                    <div className="item-info">
                      <p className="item-title">{item.title}</p>
                      <p className="item-qty">Qty: {item.quantity}</p>
                    </div>
                    <div className="item-price">₹{item.price}</div>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <p>
                  <strong>Total:</strong> ₹{order.amount}
                </p>
                <p>
                  <strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MyOrdersPage;
