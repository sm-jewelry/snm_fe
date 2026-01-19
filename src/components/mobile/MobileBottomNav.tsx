"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

interface MobileBottomNavProps {
  cartCount?: number;
  wishlistCount?: number;
}

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

const MobileBottomNav: React.FC<MobileBottomNavProps> = () => {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Fetch counts
  useEffect(() => {
    const fetchCounts = () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setCartCount(0);
        setWishlistCount(0);
        return;
      }

      // Fetch cart count
      fetch(`${API_GATEWAY_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.data?.items) {
            const totalQty = data.data.items.reduce(
              (acc: number, item: any) => acc + item.quantity,
              0
            );
            setCartCount(totalQty);
          }
        })
        .catch(console.error);

      // Fetch wishlist count
      fetch(`${API_GATEWAY_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      })
        .then((res) => res.json())
        .then((data) => {
          setWishlistCount(data?.data?.products?.length || 0);
        })
        .catch(console.error);
    };

    fetchCounts();

    // Listen for updates
    const handleCartUpdate = () => fetchCounts();
    const handleWishlistUpdate = () => fetchCounts();

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("wishlistUpdated", handleWishlistUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
    };
  }, []);

  const isActive = (path: string) => {
    if (path === "/") return router.pathname === "/";
    return router.pathname.startsWith(path);
  };

  const navItems = [
    { path: "/", icon: "home", label: "Home", isHome: true },
    { path: "/search", icon: "search", label: "Search" },
    { path: "/wishlist", icon: "heart", label: "Wishlist", badge: wishlistCount },
    { path: "/cart", icon: "cart", label: "Cart", badge: cartCount },
    { path: "/profile", icon: "user", label: "Account" },
  ];

  const getIcon = (icon: string) => {
    switch (icon) {
      case "home":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        );
      case "search":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        );
      case "heart":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        );
      case "cart":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        );
      case "user":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          className={`bottom-nav-item ${isActive(item.path) ? "active" : ""} ${item.isHome ? "home-btn" : ""}`}
        >
          <span className="bottom-nav-icon">
            {getIcon(item.icon)}
            {item.badge !== undefined && item.badge > 0 && (
              <span className="bottom-nav-badge">
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            )}
          </span>
          <span className="bottom-nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
