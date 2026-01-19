"use client";

import React, { useEffect, useState, JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../../contexts/AuthContext";

interface Category {
  _id: string;
  name: string;
  parents?: string[];
  level?: string;
}

interface MobileSlideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

const MobileSlideMenu: React.FC<MobileSlideMenuProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  useEffect(() => {
    // Fetch categories
    fetch(`${API_GATEWAY_URL}/api/categories/level/C1`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    // Prevent body scroll when menu is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleLinkClick = () => {
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    onClose();
    router.push("/");
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const menuItems = [
    { icon: "home", label: "Home", path: "/" },
    { icon: "grid", label: "Shop All", path: "/shop" },
    { icon: "star", label: "New Arrivals", path: "/products/new-arrivals" },
    { icon: "award", label: "Best Sellers", path: "/best" },
    { icon: "tag", label: "Brands", path: "/brands" },
    { icon: "map-pin", label: "Find Store", path: "/find-store" },
  ];

  const accountItems = [
    { icon: "user", label: "My Profile", path: "/profile" },
    { icon: "package", label: "My Orders", path: "/my-orders" },
    { icon: "heart", label: "Wishlist", path: "/wishlist" },
    { icon: "shopping-cart", label: "Cart", path: "/cart" },
  ];

  const infoItems = [
    { icon: "info", label: "About Us", path: "/legal/about-us" },
    { icon: "phone", label: "Contact Us", path: "/legal/contact-us" },
    { icon: "help-circle", label: "FAQs", path: "/legal/faqs" },
    { icon: "truck", label: "Shipping", path: "/legal/shipping" },
    { icon: "refresh-cw", label: "Returns", path: "/legal/returns-exchanges" },
  ];

  const getIcon = (icon: string) => {
    const icons: { [key: string]: JSX.Element } = {
      home: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
      grid: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
      star: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
      award: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>,
      tag: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>,
      "map-pin": <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
      user: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
      package: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
      heart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
      "shopping-cart": <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>,
      info: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>,
      phone: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>,
      "help-circle": <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
      truck: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>,
      "refresh-cw": <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>,
      "log-out": <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
      "log-in": <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>,
      "chevron-right": <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>,
      "chevron-down": <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>,
    };
    return icons[icon] || null;
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`mobile-menu-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
      />

      {/* Slide Menu */}
      <div className={`mobile-slide-menu ${isOpen ? "show" : ""}`}>
        {/* Header */}
        <div className="mobile-menu-header">
          <span className="mobile-menu-logo">SNM</span>
          <button className="mobile-menu-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="mobile-menu-content">
          {/* Main Navigation */}
          <div className="mobile-menu-section-title">Menu</div>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="mobile-menu-item"
              onClick={handleLinkClick}
            >
              <span className="mobile-menu-item-icon">{getIcon(item.icon)}</span>
              {item.label}
            </Link>
          ))}

          <div className="mobile-menu-divider" />

          {/* Categories */}
          {categories.length > 0 && (
            <>
              <div className="mobile-menu-section-title">Categories</div>
              {categories.map((category) => (
                <Link
                  key={category._id}
                  href={`/shop/category/${category._id}`}
                  className="mobile-menu-item"
                  onClick={handleLinkClick}
                >
                  <span className="mobile-menu-item-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </span>
                  {category.name}
                </Link>
              ))}
              <div className="mobile-menu-divider" />
            </>
          )}

          {/* Account */}
          <div className="mobile-menu-section-title">Account</div>
          {accountItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="mobile-menu-item"
              onClick={handleLinkClick}
            >
              <span className="mobile-menu-item-icon">{getIcon(item.icon)}</span>
              {item.label}
            </Link>
          ))}

          <div className="mobile-menu-divider" />

          {/* Information */}
          <div className="mobile-menu-section-title">Information</div>
          {infoItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="mobile-menu-item"
              onClick={handleLinkClick}
            >
              <span className="mobile-menu-item-icon">{getIcon(item.icon)}</span>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="mobile-menu-footer">
          {user ? (
            <>
              <div className="mobile-menu-user">
                <div className="mobile-menu-avatar">
                  {user.firstName?.[0] || user.email?.[0] || "U"}
                </div>
                <div className="mobile-menu-user-info">
                  <h4>{user.firstName ? `${user.firstName} ${user.lastName || ""}` : "User"}</h4>
                  <p>{user.email}</p>
                </div>
              </div>
              <button
                className="mobile-menu-item"
                onClick={handleLogout}
                style={{ width: "100%", border: "none", background: "transparent", cursor: "pointer", color: "#ef4444" }}
              >
                <span className="mobile-menu-item-icon">{getIcon("log-out")}</span>
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="mobile-menu-item"
              onClick={handleLinkClick}
              style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)", color: "#000", borderRadius: "12px", justifyContent: "center", fontWeight: 700 }}
            >
              <span className="mobile-menu-item-icon">{getIcon("log-in")}</span>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileSlideMenu;
