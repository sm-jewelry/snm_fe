"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import Seo from "../../components/common/Seo";
import ProductCard from "../../components/products/ProductCard";

interface Product {
  _id: string;
  title: string;
  price: number;
  URL: string;
  rating?: number;
  reviewCount?: number;
  salesCount?: number;
  brand?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  oldPrice?: number;
}

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:8000";

export default function ShopPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filters
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Infinite scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadProducts = useCallback(async (pageNum: number, reset = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "12",
        sortBy,
        sortOrder,
      });

      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(
        `${API_GATEWAY_URL}/api/catalogs?${params}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        const newProducts = data.products || [];

        setProducts((prev) => reset ? newProducts : [...prev, ...newProducts]);
        setTotalProducts(data.pagination?.total || 0);
        setHasMore(pageNum < (data.pagination?.pages || 1));
      } else {
        console.error("Failed to load products");
      }
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, sortBy, sortOrder, minPrice, maxPrice, searchQuery]);

  // Initial load
  useEffect(() => {
    setProducts([]);
    setPage(1);
    loadProducts(1, true);
  }, [sortBy, sortOrder, minPrice, maxPrice, searchQuery]);

  // Infinite scroll observer
  useEffect(() => {
    if (loading || !hasMore) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => {
            const nextPage = prev + 1;
            loadProducts(nextPage);
            return nextPage;
          });
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [loading, hasMore, loadProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setProducts([]);
    setPage(1);
    loadProducts(1, true);
  };

  const resetFilters = () => {
    setSortBy("createdAt");
    setSortOrder("desc");
    setMinPrice("");
    setMaxPrice("");
    setSearchQuery("");
  };

  return (
    <>
      <Seo
        title="Shop All Jewelry - SNM Jewelry"
        description="Explore our complete collection of exquisite jewelry. Find the perfect piece from our wide selection of necklaces, earrings, rings, bracelets, and more."
      />

      <div className="shop-page">
        {/* Hero Banner */}
        <div className="shop-hero">
          <div className="hero-content">
            <h1 className="hero-title">Discover Timeless Elegance</h1>
            <p className="hero-subtitle">
              Explore our exquisite collection of handcrafted jewelry
            </p>
          </div>
        </div>

        <div className="shop-container">
          {/* Filters & Sorting Bar */}
          <div className="shop-controls">
            <div className="controls-top">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  placeholder="Search jewelry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-btn">
                  🔍 Search
                </button>
              </form>

              {/* Results Count */}
              <div className="results-count">
                {totalProducts > 0 ? (
                  <span>
                    Showing {products.length} of {totalProducts} products
                  </span>
                ) : (
                  <span>No products found</span>
                )}
              </div>
            </div>

            <div className="controls-bottom">
              {/* Sort Options */}
              <div className="sort-section">
                <label>Sort by:</label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split("-");
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder);
                  }}
                  className="sort-select"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating-desc">Highest Rated</option>
                  <option value="salesCount-desc">Most Popular</option>
                </select>
              </div>

              {/* Price Filter */}
              <div className="price-filter">
                <label>Price Range:</label>
                <div className="price-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="price-input"
                  />
                  <span className="price-separator">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="price-input"
                  />
                </div>
              </div>

              {/* Reset Filters */}
              <button onClick={resetFilters} className="reset-btn">
                Reset Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          {products.length === 0 && !loading ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h2>No products found</h2>
              <p>Try adjusting your filters or search query</p>
              <button onClick={resetFilters} className="btn-primary">
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Loading Indicator */}
              {loading && (
                <div className="loading-more">
                  <div className="shimmer-grid">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="shimmer-card">
                        <div className="shimmer-image"></div>
                        <div className="shimmer-text"></div>
                        <div className="shimmer-text short"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Infinite Scroll Trigger */}
              {hasMore && !loading && (
                <div ref={loadMoreRef} className="load-more-trigger">
                  <div className="loading-spinner"></div>
                </div>
              )}

              {/* End of Results */}
              {!hasMore && products.length > 0 && (
                <div className="end-message">
                  <p>✨ You've viewed all products ✨</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
