"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface CatalogProduct {
  _id: string;
  title: string;
  price: number;
  URL?: string;
  description?: string;
}

interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  URL?: string; // product image
  description?: string;
}

interface PaymentDetails {
  status?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

interface Order {
  _id: string;
  amount: number;
  status: string;
  createdAt: string;
  paymentMethod?: string;
  paymentId?: string;
  razorpayOrderId?: string;
  items: OrderItem[];
}

const ORDER_API = process.env.NEXT_PUBLIC_ORDER_API_BASE_URL;
const CATALOG_API = process.env.NEXT_PUBLIC_CATEGORY_API_BASE_URL;

const OrderDetailsPage: React.FC = () => {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("Please log in to view order details.");

        // 1️⃣ Fetch order
        const orderRes = await fetch(`${ORDER_API}/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const orderData = await orderRes.json();
        if (!orderRes.ok) throw new Error(orderData.message || "Failed to fetch order");

        const orderObj: Order = orderData.data;

        // 2️⃣ Fetch catalog details
        const itemsWithDetails: OrderItem[] = await Promise.all(
          orderObj.items.map(async (item) => {
            try {
              const productRes = await fetch(`${CATALOG_API}/api/catalogs/${item.productId}`);
              const productData: CatalogProduct = await productRes.json();
              return {
                ...item,
                title: productData.title || item.title,
                price: productData.price || item.price,
                URL: productData.URL || item.URL,
                description: productData.description || "",
              };
            } catch {
              return item;
            }
          })
        );

        setOrder({ ...orderObj, items: itemsWithDetails });

        // 3️⃣ Fetch payment details (optional)
        if (orderObj.razorpayOrderId) {
          const paymentRes = await fetch(`${ORDER_API}/api/payments/${orderObj.razorpayOrderId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const paymentData = await paymentRes.json();
          if (paymentRes.ok) setPayment(paymentData.data);
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading order details...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red", marginTop: "50px" }}>{error}</p>;
  if (!order) return <p style={{ textAlign: "center", marginTop: "50px" }}>Order not found!</p>;

  return (
    <div className="order-details-page" style={{ padding: "40px", fontFamily: "Segoe UI, Tahoma, sans-serif" }}>
      <h1 style={{ marginBottom: "20px" }}>Order Details</h1>

      <div className="checkout-container" style={{ flexDirection: "column", gap: "20px" }}>
        {/* Order Summary */}
        <div className="checkout-right">
          <div className="summary-row">
            <span><strong>Order ID:</strong></span>
            <span>{order._id}</span>
          </div>
          <div className="summary-row">
            <span><strong>Status:</strong></span>
            <span className={`order-status ${order.status}`}>{order.status.toUpperCase()}</span>
          </div>
          <div className="summary-row">
            <span><strong>Date:</strong></span>
            <span>{new Date(order.createdAt).toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span><strong>Total Amount:</strong></span>
            <span>₹{order.amount}</span>
          </div>
          {order.paymentMethod && (
            <div className="summary-row">
              <span><strong>Payment Method:</strong></span>
              <span>{order.paymentMethod}</span>
            </div>
          )}
          {payment && (
            <>
              <div className="summary-row">
                <span><strong>Payment Status:</strong></span>
                <span className={`order-status ${order.status}`}>{payment.status?.toUpperCase()}</span>
              </div>
              {payment.razorpayPaymentId && (
                <div className="summary-row">
                  <span><strong>Razorpay Payment ID:</strong></span>
                  <span>{payment.razorpayPaymentId}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Order Items */}
        <div className="checkout-items">
          {order.items.map((item, index) => (
            <div
              key={index}
              className="checkout-item"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                borderBottom: "1px solid #eee",
                padding: "10px 0",
              }}
            >
              {item.URL && (
                <div style={{ position: "relative" }}>
                  <img
                    src={item.URL}
                    alt={item.title}
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: "-5px",
                      right: "-5px",
                      background: "#ff5722",
                      color: "#fff",
                      borderRadius: "50%",
                      padding: "2px 6px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {item.quantity}
                  </span>
                </div>
              )}
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 5px", fontWeight: "bold" }}>{item.title}</p>
                <p style={{ margin: "0 0 5px" }}>₹{item.price}</p>
                {item.description && <p style={{ margin: 0, fontSize: "12px", color: "#555" }}>{item.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
