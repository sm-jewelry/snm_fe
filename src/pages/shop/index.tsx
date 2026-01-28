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
  category?: string;
  collection?: any;
  c1?: string;
  c2?: string;
  c3?: string;
}

interface Category {
  _id: string;
  name: string;
}

interface Collection {
  _id: string;
  name: string;
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

  // Category, Collection, and Rating filters
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [minRating, setMinRating] = useState("");

  // Mobile filter drawer state
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Infinite scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Close filter drawer when pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFilterOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent body scroll when filter is open
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFilterOpen]);

  // Get active filter count for mobile button
  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (selectedCollection !== "all") count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    if (minRating) count++;
    if (searchQuery) count++;
    return count;
  };

  // Fetch categories on mount
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/categories/level/C1`, {
        credentials: "include",
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  // Fetch collections on mount
  const fetchCollections = async () => {
    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/collections`, {
        credentials: "include",
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setCollections(data);
      } else {
        setCollections([]);
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
      setCollections([]);
    }
  };

  // Fetch categories and collections on mount
  useEffect(() => {
    fetchCategories();
    fetchCollections();
  }, []);

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
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (selectedCollection !== "all") params.append("collection", selectedCollection);
      if (minRating) params.append("minRating", minRating);

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
  }, [loading, sortBy, sortOrder, minPrice, maxPrice, searchQuery, selectedCategory, selectedCollection, minRating]);

  // Initial load
  useEffect(() => {
    setProducts([]);
    setPage(1);
    loadProducts(1, true);
  }, [sortBy, sortOrder, minPrice, maxPrice, searchQuery, selectedCategory, selectedCollection, minRating]);

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
    setSelectedCategory("all");
    setSelectedCollection("all");
    setMinRating("");
  };

  // Get category/collection name for filter pills
  const getCategoryName = (id: string) => {
    const cat = categories.find(c => c._id === id);
    return cat?.name || '';
  };

  const getCollectionName = (id: string) => {
    const col = collections.find(c => c._id === id);
    return col?.name || '';
  };

  // Get rating label for filter pills
  const getRatingLabel = (rating: string) => {
    return `${rating}+ Stars`;
  };

  // Get sort label for display
  const getSortLabel = () => {
    const sortValue = `${sortBy}-${sortOrder}`;
    const labels: Record<string, string> = {
      'createdAt-desc': 'Newest First',
      'createdAt-asc': 'Oldest First',
      'price-asc': 'Price: Low to High',
      'price-desc': 'Price: High to Low',
      'rating-desc': 'Highest Rated',
      'salesCount-desc': 'Most Popular',
    };
    return labels[sortValue] || 'Newest First';
  };

  return (
    <>
      <Seo
        title="Shop All Jewelry - SNM Jewelry"
        description="Explore our complete collection of exquisite jewelry. Find the perfect piece from our wide selection of necklaces, earrings, rings, bracelets, and more."
      />

      <div className="shop-page">
        {/* Mobile Filter Button */}
        <button
          className="mobile-filter-btn"
          onClick={() => setIsFilterOpen(true)}
          aria-label="Open filters"
        >
          <span className="filter-btn-icon">⚙️</span>
          <span className="filter-btn-text">
            {getActiveFilterCount() > 0 ? `Filter (${getActiveFilterCount()})` : 'Filter'}
          </span>
        </button>

        {/* Filter Overlay */}
        <div
          className={`filter-overlay ${isFilterOpen ? 'active' : ''}`}
          onClick={() => setIsFilterOpen(false)}
        />

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
          {/* Mobile Sort Row */}
          <div className="mobile-sort-row">
            <label>Sort:</label>
            <select
              className="mobile-sort-select"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split("-");
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="salesCount-desc">Most Popular</option>
            </select>
          </div>

          {/* Active Filter Pills (Mobile) */}
          {(minPrice || maxPrice || searchQuery || selectedCategory !== "all" || selectedCollection !== "all" || minRating) && (
            <div className="active-filter-pills">
              {searchQuery && (
                <span className="filter-pill">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery('')}>✕</button>
                </span>
              )}
              {selectedCategory !== "all" && (
                <span className="filter-pill">
                  {getCategoryName(selectedCategory)}
                  <button onClick={() => setSelectedCategory('all')}>✕</button>
                </span>
              )}
              {selectedCollection !== "all" && (
                <span className="filter-pill">
                  {getCollectionName(selectedCollection)}
                  <button onClick={() => setSelectedCollection('all')}>✕</button>
                </span>
              )}
              {minRating && (
                <span className="filter-pill">
                  {getRatingLabel(minRating)}
                  <button onClick={() => setMinRating('')}>✕</button>
                </span>
              )}
              {minPrice && (
                <span className="filter-pill">
                  Min: ₹{minPrice}
                  <button onClick={() => setMinPrice('')}>✕</button>
                </span>
              )}
              {maxPrice && (
                <span className="filter-pill">
                  Max: ₹{maxPrice}
                  <button onClick={() => setMaxPrice('')}>✕</button>
                </span>
              )}
            </div>
          )}

          {/* Filters & Sorting Bar / Mobile Drawer */}
          <div className={`shop-controls ${isFilterOpen ? 'open' : ''}`}>
            {/* Mobile Filter Header */}
            <div className="mobile-filter-header">
              <h2 className="mobile-filter-title">Filters & Sort</h2>
              <button
                className="mobile-filter-close"
                onClick={() => setIsFilterOpen(false)}
                aria-label="Close filters"
              >
                ✕
              </button>
            </div>

            {/* Filter Content */}
            <div className="filter-content">
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

                {/* Category Filter */}
                <div className="filter-section">
                  <label>Category:</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Collection Filter */}
                <div className="filter-section">
                  <label>Collection:</label>
                  <select
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Collections</option>
                    {collections.map((collection) => (
                      <option key={collection._id} value={collection._id}>
                        {collection.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter */}
                <div className="filter-section">
                  <label>Minimum Rating:</label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Ratings</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                    <option value="1">1+ Stars</option>
                  </select>
                </div>

                {/* Price Filter */}
                <div className="price-filter">
                  <label>Price Range:</label>
                  <div className="price-inputs">
                    <input
                      type="number"
                      placeholder="Min ₹"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="price-input"
                    />
                    <span className="price-separator">-</span>
                    <input
                      type="number"
                      placeholder="Max ₹"
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

                {/* Apply Filters Button (Mobile) */}
                <button
                  className="apply-filters-btn"
                  onClick={() => setIsFilterOpen(false)}
                >
                  Apply Filters ({totalProducts} products)
                </button>
              </div>
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
