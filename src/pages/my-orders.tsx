"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  url?: string;
}

interface Order {
  _id: string;
  amount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  paymentMethod?: string;
}

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

const MyOrdersPage: React.FC = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setError("Please log in to view your orders.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_GATEWAY_URL}/api/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return '#22c55e';
      case 'shipped': return '#3b82f6';
      case 'processing': return '#f59e0b';
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      case 'paid': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return '✓';
      case 'shipped': return '🚚';
      case 'processing': return '⏳';
      case 'pending': return '⏳';
      case 'cancelled': return '✕';
      case 'paid': return '✓';
      default: return '•';
    }
  };

  const filteredOrders = activeFilter === "all"
    ? orders
    : orders.filter(order => order.status.toLowerCase() === activeFilter);

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  // Loading state
  if (loading) {
    return (
      <>
        <div className="orders-loading-page">
          <div className="orders-loading-spinner"></div>
          <p>Loading your orders...</p>
        </div>
        <style jsx>{`
          .orders-loading-page {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
          }
          .orders-loading-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #FFD700;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          .orders-loading-page p {
            color: #666;
            font-size: 16px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <div className="orders-error-page">
          <div className="orders-error-icon">⚠️</div>
          <h2>Unable to Load Orders</h2>
          <p>{error}</p>
          <button onClick={() => router.push("/login")}>Sign In</button>
        </div>
        <style jsx>{`
          .orders-error-page {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            padding: 20px;
            text-align: center;
            background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
          }
          .orders-error-icon {
            font-size: 64px;
          }
          .orders-error-page h2 {
            font-size: 24px;
            color: #1a1a1a;
            margin: 0;
          }
          .orders-error-page p {
            color: #666;
            font-size: 16px;
            margin: 0;
          }
          .orders-error-page button {
            margin-top: 16px;
            padding: 14px 32px;
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            color: #000;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
          }
        `}</style>
      </>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <>
        <div className="orders-empty-page">
          <div className="orders-empty-icon">📦</div>
          <h2>No Orders Yet</h2>
          <p>You haven't placed any orders yet. Start shopping our beautiful jewelry collection!</p>
          <button onClick={() => router.push("/shop")}>Browse Collection</button>
        </div>
        <style jsx>{`
          .orders-empty-page {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            padding: 20px;
            text-align: center;
            background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
          }
          .orders-empty-icon {
            font-size: 80px;
          }
          .orders-empty-page h2 {
            font-size: 24px;
            font-weight: 800;
            color: #1a1a1a;
            margin: 0;
          }
          .orders-empty-page p {
            color: #666;
            font-size: 16px;
            margin: 0;
            max-width: 300px;
          }
          .orders-empty-page button {
            margin-top: 16px;
            padding: 14px 32px;
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            color: #000;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <div className="orders-page">
        {/* Header */}
        <div className="orders-header">
          <h1>My Orders</h1>
          <p className="orders-count">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Filter Tabs */}
        <div className="orders-filters">
          <div className="filters-scroll">
            {filterOptions.map((filter) => (
              <button
                key={filter.value}
                className={`filter-btn ${activeFilter === filter.value ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter.value)}
              >
                {filter.label}
                {filter.value !== "all" && (
                  <span className="filter-count">
                    {orders.filter(o => o.status.toLowerCase() === filter.value).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="no-filtered-orders">
              <p>No {activeFilter} orders found</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <Link href={`/my-orders/${order._id}`} key={order._id} className="order-link">
                <div className="order-card">
                  {/* Order Header */}
                  <div className="order-card-header">
                    <div className="order-id-date">
                      <span className="order-id">#{order._id.slice(-8).toUpperCase()}</span>
                      <span className="order-date">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div
                      className="order-status-badge"
                      style={{
                        background: `${getStatusColor(order.status)}15`,
                        color: getStatusColor(order.status)
                      }}
                    >
                      <span className="status-icon">{getStatusIcon(order.status)}</span>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="order-items-preview">
                    {order.items.slice(0, 2).map((item, i) => (
                      <div key={i} className="order-item-row">
                        <div className="item-image-placeholder">
                          {item.url ? (
                            <img src={item.url} alt={item.title} />
                          ) : (
                            <span>💎</span>
                          )}
                        </div>
                        <div className="item-details">
                          <span className="item-title">{item.title}</span>
                          <span className="item-meta">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div className="more-items">
                        +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* Order Footer */}
                  <div className="order-card-footer">
                    <div className="order-total">
                      <span className="total-label">Total</span>
                      <span className="total-amount">₹{order.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="view-details">
                      View Details
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .orders-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
          padding: 24px 20px 100px;
        }

        .orders-header {
          margin-bottom: 24px;
        }

        .orders-header h1 {
          font-size: 28px;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0 0 4px 0;
        }

        .orders-count {
          color: #666;
          font-size: 14px;
          margin: 0;
        }

        /* Filters */
        .orders-filters {
          margin-bottom: 20px;
          margin-left: -20px;
          margin-right: -20px;
          padding: 0 20px;
        }

        .filters-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 8px;
          -webkit-overflow-scrolling: touch;
        }

        .filters-scroll::-webkit-scrollbar {
          display: none;
        }

        .filter-btn {
          flex-shrink: 0;
          padding: 10px 16px;
          border: 2px solid #e5e5e5;
          background: #fff;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 600;
          color: #666;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .filter-btn.active {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          border-color: #FFD700;
          color: #000;
        }

        .filter-count {
          background: rgba(0,0,0,0.1);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
        }

        .filter-btn.active .filter-count {
          background: rgba(0,0,0,0.15);
        }

        /* Orders List */
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .order-link {
          text-decoration: none;
          color: inherit;
        }

        .order-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .order-card:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
          transform: translateY(-2px);
        }

        .order-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #f0f0f0;
        }

        .order-id-date {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .order-id {
          font-size: 14px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .order-date {
          font-size: 12px;
          color: #999;
        }

        .order-status-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }

        .status-icon {
          font-size: 10px;
        }

        /* Order Items */
        .order-items-preview {
          padding: 16px;
        }

        .order-item-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
        }

        .order-item-row:not(:last-child) {
          border-bottom: 1px solid #f5f5f5;
        }

        .item-image-placeholder {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          background: linear-gradient(135deg, #f8f8f8 0%, #fff5e6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          overflow: hidden;
        }

        .item-image-placeholder img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .item-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .item-title {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .item-meta {
          font-size: 12px;
          color: #666;
        }

        .more-items {
          padding-top: 8px;
          font-size: 13px;
          color: #999;
          font-weight: 500;
        }

        /* Order Footer */
        .order-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: linear-gradient(135deg, #f8f8f8 0%, #fff5e6 100%);
          border-top: 1px solid #f0f0f0;
        }

        .order-total {
          display: flex;
          flex-direction: column;
        }

        .total-label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .total-amount {
          font-size: 18px;
          font-weight: 800;
          color: #1a1a1a;
        }

        .view-details {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          font-weight: 600;
          color: #FFD700;
        }

        .no-filtered-orders {
          text-align: center;
          padding: 40px 20px;
          background: #fff;
          border-radius: 16px;
          color: #666;
        }

        /* Desktop Styles */
        @media (min-width: 769px) {
          .orders-page {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px 100px;
          }

          .orders-header h1 {
            font-size: 36px;
          }

          .order-card-header {
            padding: 20px 24px;
          }

          .order-items-preview {
            padding: 20px 24px;
          }

          .order-card-footer {
            padding: 20px 24px;
          }

          .item-image-placeholder {
            width: 60px;
            height: 60px;
          }

          .item-title {
            font-size: 15px;
          }

          .total-amount {
            font-size: 20px;
          }
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
          .orders-page {
            padding: 16px 16px calc(80px + env(safe-area-inset-bottom, 20px));
          }

          .orders-header {
            margin-bottom: 16px;
          }

          .orders-header h1 {
            font-size: 24px;
          }

          .orders-filters {
            margin-left: -16px;
            margin-right: -16px;
            padding: 0 16px;
          }

          .filter-btn {
            padding: 8px 14px;
            font-size: 13px;
          }

          .order-card {
            border-radius: 14px;
          }

          .order-card-header {
            padding: 14px;
          }

          .order-items-preview {
            padding: 14px;
          }

          .order-card-footer {
            padding: 14px;
          }

          .item-image-placeholder {
            width: 44px;
            height: 44px;
          }
        }

        @media (max-width: 480px) {
          .orders-header h1 {
            font-size: 22px;
          }

          .order-id {
            font-size: 13px;
          }

          .order-status-badge {
            padding: 5px 10px;
            font-size: 11px;
          }

          .item-title {
            font-size: 13px;
          }

          .total-amount {
            font-size: 16px;
          }
        }
      `}</style>
    </>
  );
};

export default MyOrdersPage;
