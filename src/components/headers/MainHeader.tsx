import Link from "next/link";
import React, { useEffect, useState } from "react";
import CartDrawer from "../CartDrawer";

interface Category {
  _id: string;
  name: string;
}

// ✅ Use environment variables
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const CATEGORY_API_BASE = process.env.NEXT_PUBLIC_CATEGORY_API_BASE_URL;

const WISHLIST_API = `${API_BASE}/api/wishlist`;
const CART_API = `${API_BASE}/api/cart`;
const CATEGORY_API = `${CATEGORY_API_BASE}/api/categories/level`;

const MainHeader: React.FC = () => {
  const [c1, setC1] = useState<Category[]>([]);
  const [cartCount, setCartCount] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState<number>(0);

  // 🔹 Fetch wishlist count
  const fetchWishlistCount = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return setWishlistCount(0);

    fetch(WISHLIST_API, {
      headers: { Authorization: `Bearer ${token}` },
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

    // Listen for wishlist updates
    const handleWishlistUpdate = () => fetchWishlistCount();
    window.addEventListener("wishlistUpdated", handleWishlistUpdate);

    return () => {
      window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
    };
  }, []);

  // 🔹 Fetch cart count
  const fetchCartCount = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch(CART_API, {
      headers: { Authorization: `Bearer ${token}` },
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

    // Fetch categories (C1)
    fetch(`${CATEGORY_API}/C1`)
      .then((res) => res.json())
      .then((data) => setC1(data))
      .catch((err) => console.error("Failed to fetch C1 categories:", err));

    // Fetch cart count
    fetchCartCount();

    // Listen for cart updates
    const handleCartUpdate = () => fetchCartCount();
    window.addEventListener("cartUpdated", handleCartUpdate);

    // Cleanup
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  if (!isClient) return null; // prevents hydration mismatch

  return (
    <header className="main-header flex justify-between items-center px-6 py-3 border-b relative">
      {/* Left nav (C1 categories) */}
      <nav className="flex gap-4">
        {c1.map((category) => (
          <Link
            key={category._id}
            href={`/category/${category._id}`}
            className="nav-link text-gray-700 hover:text-black"
          >
            {category.name}
          </Link>
        ))}
        <Link
          href="/find-store"
          className="nav-link text-gray-700 hover:text-black"
        >
          Find a Store
        </Link>
      </nav>

      {/* Logo */}
      <Link href="/" className="text-2xl font-bold">
        SNM
      </Link>

      {/* Right icons */}
      <div className="flex items-center gap-4 main-header-icons">
        <Link href="/search" aria-label="Search" className="cart-icon">
          🔍
        </Link>

        <Link href="/profile" aria-label="Profile" className="cart-icon">
          👤
        </Link>

        <Link href="/wishlist" aria-label="Wishlist" className="cart-icon relative">
          ❤️
          {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
        </Link>

        {/* Cart button to open drawer */}
        <button
          aria-label="Cart"
          className="cart-icon relative"
          onClick={() => setIsCartOpen(true)}
        >
          🛒
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default MainHeader;
