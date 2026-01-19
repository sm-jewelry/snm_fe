"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import CartDrawer from "../CartDrawer";

interface Category {
  _id: string;
  name: string;
  parents?: string[];
  level?: string;
}

interface MainHeaderProps {
  onMenuClick?: () => void;
  isMenuOpen?: boolean;
}

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

const WISHLIST_API = `${API_GATEWAY_URL}/api/wishlist`;
const CART_API = `${API_GATEWAY_URL}/api/cart`;
const CATEGORY_API = `${API_GATEWAY_URL}/api/categories/level`;

const MainHeader: React.FC<MainHeaderProps> = ({ onMenuClick, isMenuOpen = false }) => {
  const [c1, setC1] = useState<Category[]>([]);
  const [c2, setC2] = useState<Category[]>([]);
  const [cartCount, setCartCount] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState<number>(0);

  // Fetch wishlist count
  const fetchWishlistCount = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return setWishlistCount(0);

    fetch(WISHLIST_API, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        setWishlistCount(data?.data?.products?.length || 0);
      })
      .catch((err) => console.error("Failed to fetch wishlist:", err));
  };

  useEffect(() => {
    setIsClient(true);
    fetchWishlistCount();

    const handleWishlistUpdate = () => fetchWishlistCount();
    window.addEventListener("wishlistUpdated", handleWishlistUpdate);

    return () => {
      window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
    };
  }, []);

  // Fetch cart count
  const fetchCartCount = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch(CART_API, {
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
        } else {
          setCartCount(0);
        }
      })
      .catch((err) => console.error("Failed to fetch cart:", err));
  };

  useEffect(() => {
    setIsClient(true);

    // Fetch categories (C1 and C2) in parallel
    Promise.all([
      fetch(`${CATEGORY_API}/C1`, {
        credentials: 'include',
      }).then((res) => res.json()),
      fetch(`${CATEGORY_API}/C2`, {
        credentials: 'include',
      }).then((res) => res.json()),
    ])
      .then(([c1Data, c2Data]) => {
        setC1(c1Data);
        setC2(c2Data);
      })
      .catch((err) => console.error("Failed to fetch categories:", err));

    // Fetch cart count
    fetchCartCount();

    // Listen for cart updates
    const handleCartUpdate = () => fetchCartCount();
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  // Helper function to get child categories
  const getChildren = (parentId: string, categories: Category[]) =>
    categories.filter((cat) => cat.parents?.includes(parentId));

  // Toggle menu handler
  const handleMenuToggle = () => {
    onMenuClick?.();
  };

  if (!isClient) return null;

  return (
    <header className="main-header flex justify-between items-center px-6 py-3 border-b relative">
      {/* Mobile Menu Button - UPDATED */}
      <button
        className={`mobile-menu-btn ${isMenuOpen ? 'active' : ''}`}
        onClick={handleMenuToggle}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Left nav (C1 categories with C2 dropdowns) - Desktop Only */}
      <nav className="flex gap-4 main-header-nav">
        {c1.map((category) => (
          <div key={category._id} className="dropdown">
            <Link
              href={`/shop/category/${category._id}`}
              className="nav-link text-gray-700 hover:text-black"
            >
              {category.name}
            </Link>
            {getChildren(category._id, c2).length > 0 && (
              <div className="dropdown-content">
                {getChildren(category._id, c2).map((child) => (
                  <Link
                    key={child._id}
                    href={`/shop/category/${child._id}`}
                    className="dropdown-link"
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
        <Link
          href="/find-store"
          className="nav-link text-gray-700 hover:text-black"
        >
          Find a Store
        </Link>
      </nav>

      {/* Logo */}
      <Link href="/" className="text-2xl font-bold main-header-logo">
        SNM
      </Link>

      {/* Right icons */}
      <div className="flex items-center gap-4 main-header-icons">
        {/* Search - Desktop Only (hidden on mobile) */}
        <Link href="/search" aria-label="Search" className="cart-icon desktop-only">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </Link>

        {/* Profile - Desktop Only (hidden on mobile, in bottom nav) */}
        <Link href="/profile" aria-label="Profile" className="cart-icon desktop-only">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </Link>

        {/* Wishlist */}
        <Link href="/wishlist" aria-label="Wishlist" className="cart-icon relative">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
        </Link>

        {/* Cart button to open drawer */}
        <button
          aria-label="Cart"
          className="cart-icon relative"
          onClick={() => setIsCartOpen(true)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default MainHeader;