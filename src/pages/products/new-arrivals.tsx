"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Seo from "../../components/common/Seo";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

interface Product {
  _id: string;
  title: string;
  price: number;
  stock: number;
  SKU: string;
  URL: string;
  images?: string[];
  oldPrice?: number;
  colors?: string[];
  sizes?: string[];
  rating?: number;
}

interface Category {
  _id: string;
  name: string;
}

interface Collection {
  _id: string;
  name: string;
}

const API_GATEWAY_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:8000";

const NewArrivals: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCollection, setSelectedCollection] = useState("all");

  // Close filter on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFilterOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Prevent body scroll when filter open
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFilterOpen]);

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (selectedCollection !== "all") count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    return count;
  };

  // Fetch products
  useEffect(() => {
    fetch(`${API_GATEWAY_URL}/api/new-arrivals`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setProducts(data || []);
        setFilteredProducts(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load new arrivals",
        });
        setLoading(false);
      });
  }, []);

  // Fetch categories
  useEffect(() => {
    fetch(`${API_GATEWAY_URL}/api/categories/level/C1`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  // Fetch collections
  useEffect(() => {
    fetch(`${API_GATEWAY_URL}/api/collections`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setCollections(Array.isArray(data) ? data : []))
      .catch(() => setCollections([]));
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p: any) => {
        const c1Id = p.c1?._id?.toString() || p.c1?.toString() || "";
        const c2Id = p.c2?._id?.toString() || p.c2?.toString() || "";
        const c3Id = p.c3?._id?.toString() || p.c3?.toString() || "";
        const catId = p.category?._id?.toString() || p.category?.toString() || "";
        return c1Id === selectedCategory || c2Id === selectedCategory || c3Id === selectedCategory || catId === selectedCategory;
      });
    }

    // Collection filter
    if (selectedCollection !== "all") {
      filtered = filtered.filter((p: any) => {
        const colId = p.collection?._id?.toString() || p.collection?.toString() || "";
        return colId === selectedCollection;
      });
    }

    // Price filter
    if (minPrice) filtered = filtered.filter((p) => p.price >= parseFloat(minPrice));
    if (maxPrice) filtered = filtered.filter((p) => p.price <= parseFloat(maxPrice));

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, selectedCollection, minPrice, maxPrice, sortBy]);

  // Reset filters
  const resetFilters = () => {
    setSortBy("featured");
    setMinPrice("");
    setMaxPrice("");
    setSelectedCategory("all");
    setSelectedCollection("all");
  };

  // Get names for filter pills
  const getCategoryName = (id: string) => categories.find((c) => c._id === id)?.name || "";
  const getCollectionName = (id: string) => collections.find((c) => c._id === id)?.name || "";

  // 🔐 Common login popup
  const requireLogin = () =>
    Swal.fire({
      icon: "warning",
      title: "Login Required",
      text: "Please login to continue",
      confirmButtonText: "Login",
      confirmButtonColor: "#f59e0b",
    }).then((result) => {
      if (result.isConfirmed) {
        router.push("/profile");
      }
    });

  // 🛒 Add to Cart
  const handleAddToCart = async (product: Product) => {
    const token = localStorage.getItem("access_token");
    if (!token) return requireLogin();

    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          productId: product._id,
          url: product.URL,
          title: product.title,
          price: product.price,
          quantity: 1,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Added to Cart",
          text: "Product added to cart successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
        window.dispatchEvent(new CustomEvent("cartUpdated"));
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: data.message || "Failed to add to cart",
        });
      }
    } catch (err) {
      console.error("Cart Add Error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while adding to cart",
      });
    }
  };

  // ❤️ Add to Wishlist
  const handleAddToWishlist = async (product: Product) => {
    const token = localStorage.getItem("access_token");
    if (!token) return requireLogin();

    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/wishlist/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ productId: product._id }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Added to Wishlist",
          timer: 1500,
          showConfirmButton: false,
        });
        window.dispatchEvent(new CustomEvent("wishlistUpdated"));
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: data.message || "Failed to add to wishlist",
        });
      }
    } catch (err) {
      console.error("Wishlist Add Error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while adding to wishlist",
      });
    }
  };

  return (
    <>
      <Seo
        title="New Arrivals - NQD Fashion Store"
        description="Discover the latest fashion arrivals at NQD Fashion Store. Shop trendy clothing, footwear, and accessories newly added to our collection!"
        ogTitle="New Arrivals - NQD Fashion Store"
        ogDescription="Explore the freshest fashion pieces and new trends at NQD Fashion Store."
        ogType="website"
        ogImage="/assets/new-arrivals-banner.jpg"
        canonical="https://nqdstore.com/new-arrivals"
        articleTags={["new arrivals", "latest fashion", "trending styles"]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "New Arrivals - NQD Fashion Store",
          description:
            "Discover the latest fashion arrivals at NQD Fashion Store. Shop trendy clothing, footwear, and accessories newly added to our collection!",
          url: "https://nqdstore.com/new-arrivals",
          publisher: {
            "@type": "Organization",
            name: "NQD Fashion Store",
            logo: {
              "@type": "ImageObject",
              url: "https://nqdstore.com/assets/logo.png",
            },
          },
        }}
      />

      <section className="new-arrivals-page">
        {/* Mobile Filter Button */}
        <button
          className="mobile-filter-btn"
          onClick={() => setIsFilterOpen(true)}
        >
          <span className="filter-btn-icon">⚙️</span>
          <span className="filter-btn-text">
            {getActiveFilterCount() > 0 ? `Filter (${getActiveFilterCount()})` : "Filter"}
          </span>
        </button>

        {/* Filter Overlay */}
        <div
          className={`filter-overlay ${isFilterOpen ? "active" : ""}`}
          onClick={() => setIsFilterOpen(false)}
        />

        <div className="new-arrivals-hero">
          <h1>New Arrival</h1>
          <p>Shop through our latest selection of Fashion</p>
        </div>

        {/* Mobile Sort Row */}
        <div className="mobile-sort-row">
          <label>Sort:</label>
          <select
            className="mobile-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {/* Active Filter Pills */}
        {(selectedCategory !== "all" || selectedCollection !== "all" || minPrice || maxPrice) && (
          <div className="active-filter-pills">
            {selectedCategory !== "all" && (
              <span className="filter-pill">
                {getCategoryName(selectedCategory)}
                <button onClick={() => setSelectedCategory("all")}>✕</button>
              </span>
            )}
            {selectedCollection !== "all" && (
              <span className="filter-pill">
                {getCollectionName(selectedCollection)}
                <button onClick={() => setSelectedCollection("all")}>✕</button>
              </span>
            )}
            {minPrice && (
              <span className="filter-pill">
                Min: ₹{minPrice}
                <button onClick={() => setMinPrice("")}>✕</button>
              </span>
            )}
            {maxPrice && (
              <span className="filter-pill">
                Max: ₹{maxPrice}
                <button onClick={() => setMaxPrice("")}>✕</button>
              </span>
            )}
          </div>
        )}

        {/* Filter Drawer */}
        <div className={`filter-drawer ${isFilterOpen ? "open" : ""}`}>
          <div className="filter-drawer-header">
            <h2>Filters & Sort</h2>
            <button onClick={() => setIsFilterOpen(false)} className="close-btn">✕</button>
          </div>
          <div className="filter-drawer-content">
            {/* Sort */}
            <div className="filter-section">
              <label>Sort By:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Category */}
            <div className="filter-section">
              <label>Category:</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Collection */}
            <div className="filter-section">
              <label>Collection:</label>
              <select value={selectedCollection} onChange={(e) => setSelectedCollection(e.target.value)}>
                <option value="all">All Collections</option>
                {collections.map((col) => (
                  <option key={col._id} value={col._id}>{col.name}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className="filter-section">
              <label>Price Range:</label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            <button className="reset-btn" onClick={resetFilters}>Reset Filters</button>
            <button className="apply-btn" onClick={() => setIsFilterOpen(false)}>
              Apply Filters ({filteredProducts.length} products)
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h2>No products found</h2>
            <p>Try adjusting your filters</p>
            <button onClick={resetFilters} className="reset-btn">Reset Filters</button>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <div key={product._id} className="product-card">
                <div className="image-wrapper">
                  <Link href={`/products/${product._id}`}>
                    <img
                      src={product.URL}
                      alt={product.title}
                      className="product-img"
                    />
                  </Link>

                  <div className="overlay-icons">
                    <button
                      className="icon-btn"
                      title="Add to Wishlist"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToWishlist(product);
                      }}
                    >
                      ❤️
                    </button>

                    <button
                      className="icon-btn"
                      title="Add to Cart"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                    >
                      🛒
                    </button>
                  </div>
                </div>

                <Link
                  href={`/products/${product._id}`}
                  className="product-info"
                >
                  <h3>{product.title}</h3>
                  <p>₹{product.price}</p>
                  <p className="sku">SKU: {product.SKU}</p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default NewArrivals;
