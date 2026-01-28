import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProductCard from '../components/products/ProductCard';
import styles from '../styles/Search.module.css';

interface Product {
  _id: string;
  title: string;
  price: number;
  URL: string;
  salesCount?: number;
  rating?: number;
  reviewCount?: number;
  brand?: string;
  isFeatured?: boolean;
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

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]); // All fetched products
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]); // After filtering
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]); // Currently displayed
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [displayCount, setDisplayCount] = useState(12); // How many to show
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Mobile filter drawer state
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
    if (selectedCategory !== 'all') count++;
    if (selectedCollection !== 'all') count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    return count;
  };

  // Fetch all data on mount
  useEffect(() => {
    fetchAllProducts();
    fetchCategories();
    fetchCollections();
  }, []);

  // Infinite scroll - detect when user scrolls near bottom
  useEffect(() => {
    const handleScroll = () => {
      // Don't load if already loading
      if (loadingMore) return;

      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      // Check if user is near bottom (800px from bottom) - loads well before footer
      if (scrollHeight - scrollTop - clientHeight < 800) {
        loadMoreDisplayed();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filteredProducts, displayedProducts, loadingMore]);

  // Apply search query from URL
  useEffect(() => {
    if (router.query.q) {
      setSearchQuery(router.query.q as string);
    }
  }, [router.query.q]);

  // Filter products when search query or filters change
  useEffect(() => {
    filterProducts();
  }, [searchQuery, allProducts, selectedCategory, selectedCollection, sortBy, minPrice, maxPrice]);

  // Update displayed products when filtered products change
  useEffect(() => {
    setDisplayCount(12); // Reset to show first 12
    setDisplayedProducts(filteredProducts.slice(0, 12));
  }, [filteredProducts]);

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      // Fetch all products (increase limit to get all)
      const response = await fetch(`${API_GATEWAY_URL}/api/catalogs?limit=1000`, {
        credentials: 'include',
      });
      const data = await response.json();

      // API returns { products: [...], pagination: {...} }
      if (data.products && Array.isArray(data.products)) {
        setAllProducts(data.products);
      } else if (Array.isArray(data)) {
        setAllProducts(data);
      } else {
        setAllProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreDisplayed = () => {
    // Show 12 more products from filtered results
    if (displayedProducts.length < filteredProducts.length && !loadingMore) {
      setLoadingMore(true);

      // Small delay for smooth UX
      setTimeout(() => {
        const nextCount = displayCount + 12;
        setDisplayCount(nextCount);
        setDisplayedProducts(filteredProducts.slice(0, nextCount));
        setLoadingMore(false);
      }, 300);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/categories/level/C1`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchCollections = async () => {
    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/collections`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setCollections(data);
      } else {
        setCollections([]);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
      setCollections([]);
    }
  };

  const filterProducts = () => {
    let filtered = [...allProducts];

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(query) ||
          product.brand?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((product) => {
        // Categories are populated objects, need to access _id property
        // Using optional chaining to safely access nested properties
        const c1Id = (product.c1 as any)?._id?.toString() || product.c1?.toString() || '';
        const c2Id = (product.c2 as any)?._id?.toString() || product.c2?.toString() || '';
        const c3Id = (product.c3 as any)?._id?.toString() || product.c3?.toString() || '';
        const categoryId = (product.category as any)?._id?.toString() || product.category?.toString() || '';

        return c1Id === selectedCategory ||
               c2Id === selectedCategory ||
               c3Id === selectedCategory ||
               categoryId === selectedCategory;
      });
    }

    // Collection filter (uses dedicated collection field)
    if (selectedCollection !== 'all') {
      filtered = filtered.filter((product) => {
        // Check the collection field (can be populated object or ObjectId)
        // Using optional chaining to safely access nested properties
        const collectionId = (product.collection as any)?._id?.toString() || product.collection?.toString() || '';
        return collectionId === selectedCollection;
      });
    }

    // Price filter
    if (minPrice) {
      filtered = filtered.filter((product) => product.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter((product) => product.price <= parseFloat(maxPrice));
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
        break;
      default:
        // relevance - keep original order
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedCollection('all');
    setSortBy('relevance');
    setMinPrice('');
    setMaxPrice('');
    setDisplayCount(12);
    router.push('/search');
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

  return (
    <div className={styles.searchPage}>
      {/* Mobile Filter Button */}
      <button
        className={styles.mobileFilterBtn}
        onClick={() => setIsFilterOpen(true)}
        aria-label="Open filters"
      >
        <span className={styles.filterBtnIcon}>⚙️</span>
        <span className={styles.filterBtnText}>
          {getActiveFilterCount() > 0 ? `Filter (${getActiveFilterCount()})` : 'Filter'}
        </span>
      </button>

      {/* Filter Overlay */}
      {isFilterOpen && (
        <div
          className={`${styles.filterOverlay} ${styles.active}`}
          onClick={() => setIsFilterOpen(false)}
        />
      )}

      {/* Hero Section */}
      <div className={styles.searchHero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            <span className={styles.titleLine}>Discover Your Perfect</span>
            <span className={`${styles.titleLine} ${styles.gradientText}`}>Jewelry</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Search through our exquisite collection of premium jewelry
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchInputWrapper}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search for necklaces, rings, bracelets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.clearButton}
                  onClick={() => setSearchQuery('')}
                >
                  ✕
                </button>
              )}
            </div>
            <button type="submit" className={styles.searchButton}>
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.searchContainer}>
        {/* Filters Sidebar / Mobile Drawer */}
        <aside className={`${styles.filtersSidebar} ${isFilterOpen ? styles.open : ''}`}>
          {/* Mobile Filter Header */}
          <div className={styles.mobileFilterHeader}>
            <h2 className={styles.mobileFilterTitle}>Filters & Sort</h2>
            <button
              className={styles.mobileFilterClose}
              onClick={() => setIsFilterOpen(false)}
              aria-label="Close filters"
            >
              ✕
            </button>
          </div>

          {/* Filter Content */}
          <div className={styles.filterContent}>
            <div className={styles.filtersHeader}>
              <h2 className={styles.filtersTitle}>Filters</h2>
              {(searchQuery || selectedCategory !== 'all' || selectedCollection !== 'all' || minPrice || maxPrice) && (
                <button className={styles.clearFiltersBtn} onClick={clearFilters}>
                  Clear All
                </button>
              )}
            </div>

            {/* Sort Filter - Moved to top for mobile */}
            <div className={styles.filterGroup}>
              <h3 className={styles.filterLabel}>Sort By</h3>
              <select
                className={styles.sortSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className={styles.filterGroup}>
              <h3 className={styles.filterLabel}>Category</h3>
              <select
                className={styles.sortSelect}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
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
            <div className={styles.filterGroup}>
              <h3 className={styles.filterLabel}>Collection</h3>
              <select
                className={styles.sortSelect}
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
              >
                <option value="all">All Collections</option>
                {collections.map((collection) => (
                  <option key={collection._id} value={collection._id}>
                    {collection.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div className={styles.filterGroup}>
              <h3 className={styles.filterLabel}>Price Range</h3>
              <div className={styles.priceInputs}>
                <input
                  type="number"
                  className={styles.priceInput}
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span className={styles.priceSeparator}>-</span>
                <input
                  type="number"
                  className={styles.priceInput}
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Apply Filters Button (Mobile) */}
            <button
              className={styles.applyFiltersBtn}
              onClick={() => setIsFilterOpen(false)}
            >
              Apply Filters ({filteredProducts.length} products)
            </button>

            {(selectedCategory !== 'all' || selectedCollection !== 'all' || minPrice || maxPrice) && (
              <button className={styles.clearFiltersBtn} onClick={clearFilters}>
                Clear All Filters
              </button>
            )}
          </div>
        </aside>

        {/* Results Section */}
        <main className={styles.resultsSection}>
          {/* Mobile Sort Row */}
          <div className={styles.mobileSortRow}>
            <label>Sort:</label>
            <select
              className={styles.mobileSortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {/* Active Filters Pills (Mobile) */}
          {(selectedCategory !== 'all' || selectedCollection !== 'all' || minPrice || maxPrice) && (
            <div className={styles.activeFilters}>
              {selectedCategory !== 'all' && (
                <span className={styles.filterPill}>
                  {getCategoryName(selectedCategory)}
                  <button onClick={() => setSelectedCategory('all')}>✕</button>
                </span>
              )}
              {selectedCollection !== 'all' && (
                <span className={styles.filterPill}>
                  {getCollectionName(selectedCollection)}
                  <button onClick={() => setSelectedCollection('all')}>✕</button>
                </span>
              )}
              {minPrice && (
                <span className={styles.filterPill}>
                  Min: ₹{minPrice}
                  <button onClick={() => setMinPrice('')}>✕</button>
                </span>
              )}
              {maxPrice && (
                <span className={styles.filterPill}>
                  Max: ₹{maxPrice}
                  <button onClick={() => setMaxPrice('')}>✕</button>
                </span>
              )}
            </div>
          )}
          {/* Results Header */}
          <div className={styles.resultsHeader}>
            <h2 className={styles.resultsTitle}>
              {searchQuery ? (
                <>
                  Search Results for "<span className={styles.searchTerm}>{searchQuery}</span>"
                </>
              ) : (
                'All Products'
              )}
            </h2>
            <p className={styles.resultsCount}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            </p>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>Searching our collection...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            /* No Results */
            <div className={styles.noResults}>
              <div className={styles.noResultsIcon}>🔍</div>
              <h3 className={styles.noResultsTitle}>No products found</h3>
              <p className={styles.noResultsText}>
                {searchQuery
                  ? `We couldn't find any products matching "${searchQuery}"`
                  : 'Try adjusting your filters'}
              </p>
              <button className={styles.clearFiltersBtn} onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className={styles.productsGrid}>
                {displayedProducts.map((product) => (
                  <div key={product._id} className={styles.productWrapper}>
                    <ProductCard product={product} showBadges={true} />
                  </div>
                ))}
              </div>

              {/* Load More Indicator */}
              {displayedProducts.length < filteredProducts.length && (
                <div className={styles.loadMoreContainer}>
                  <div className={styles.loadingSpinner}></div>
                  <p className={styles.loadingText}>Scroll for more...</p>
                </div>
              )}

              {/* End of Results */}
              {displayedProducts.length >= filteredProducts.length && filteredProducts.length > 0 && (
                <div className={styles.endOfResults}>
                  <div className={styles.endLine}></div>
                  <p className={styles.endText}>You've reached the end</p>
                  <div className={styles.endLine}></div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
