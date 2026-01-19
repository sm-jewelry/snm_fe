"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Seo from "../../components/common/Seo";
import ProductReviews from "../../components/reviews/ProductReviews";
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
  description?: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  salesCount?: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  collectionId?: {
    _id: string;
    name: string;
  };
}

const API_GATEWAY_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:8000";

const ProductDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [wishlisting, setWishlisting] = useState(false);
  const [userHasOrdered, setUserHasOrdered] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // 🔐 Auth check
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to view product details",
        confirmButtonText: "Login",
        confirmButtonColor: "#f59e0b",
      }).then((r) => {
        if (r.isConfirmed) router.push("/profile");
      });
    }
  }, [router]);

  // 📦 Fetch product
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch(`${API_GATEWAY_URL}/api/catalogs/${id}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setSelectedImage(data?.URL || null);
        setCurrentImageIndex(0);
        setQty(1);
      })
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch product details",
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  // 🧾 Check order
  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch(`${API_GATEWAY_URL}/api/reviews/user/can-review/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setUserHasOrdered(data.canReview || false))
      .catch(() => setUserHasOrdered(false));
  }, [id]);

  const imageList = product ? [product.URL, ...(product.images || [])] : [];
  const mainImage = selectedImage || imageList[0];
  const productUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${router.asPath}`;

  const requireLogin = () =>
    Swal.fire({
      icon: "warning",
      title: "Login Required",
      text: "Please login to continue",
      confirmButtonText: "Login",
      confirmButtonColor: "#f59e0b",
    }).then((r) => {
      if (r.isConfirmed) router.push("/profile");
    });

  // 🛒 Add to cart
  const handleAddToCart = async () => {
    if (!product) return;
    const token = localStorage.getItem("access_token");
    if (!token) return requireLogin();

    setAdding(true);
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
          quantity: qty,
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
          text: data?.message || "Failed to add to cart",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while adding to cart",
      });
    } finally {
      setAdding(false);
    }
  };

  // ❤️ Wishlist
  const handleAddToWishlist = async () => {
    if (!product) return;
    const token = localStorage.getItem("access_token");
    if (!token) return requireLogin();

    setWishlisting(true);
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
          text: data?.message || "Failed to add to wishlist",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong adding to wishlist",
      });
    } finally {
      setWishlisting(false);
    }
  };

  // ⚡ Buy now
  const handleBuyNow = () => {
    if (!product) return;
    const token = localStorage.getItem("access_token");
    if (!token) return requireLogin();

    localStorage.setItem(
      "checkoutItem",
      JSON.stringify({
        productId: product._id,
        title: product.title,
        price: product.price,
        image: product.URL,
        quantity: qty,
        total: product.price * qty,
        SKU: product.SKU,
      })
    );

    router.push("/checkout");
  };

  // 📊 Quantity handlers
  const incQty = () => {
    if (product && product.stock && qty < product.stock) {
      setQty(qty + 1);
    }
  };

  const decQty = () => {
    if (qty > 1) {
      setQty(qty - 1);
    }
  };

  // Image navigation for mobile swipe
  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
    setSelectedImage(imageList[index]);
  };

  // Loading state
  if (loading) {
    return (
      <>
        <div className="pdp-loading-container">
          <div className="pdp-loading-spinner"></div>
          <p>Loading product...</p>
        </div>
        <style jsx>{`
          .pdp-loading-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
          }
          .pdp-loading-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #FFD700;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          .pdp-loading-container p {
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

  // Not found state
  if (!product) {
    return (
      <>
        <div className="pdp-notfound-container">
          <div className="pdp-notfound-icon">💎</div>
          <h2>Product Not Found</h2>
          <p>The jewelry you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => router.push("/shop")}>Browse Collection</button>
        </div>
        <style jsx>{`
          .pdp-notfound-container {
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
          .pdp-notfound-icon {
            font-size: 64px;
          }
          .pdp-notfound-container h2 {
            font-size: 24px;
            color: #1a1a1a;
            margin: 0;
          }
          .pdp-notfound-container p {
            color: #666;
            font-size: 16px;
            margin: 0;
          }
          .pdp-notfound-container button {
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
      <Seo
        title={`${product.title} - Buy Online | SNM Jewelry Store`}
        description={`Buy ${product.title} at just ₹${product.price}. ${product.stock > 0 ? "In stock now!" : "Currently out of stock."}`}
        ogTitle={product.title}
        ogDescription={`Shop ${product.title} — available at SNM Jewelry Store.`}
        ogType="product"
        ogImage={mainImage}
        canonical={productUrl}
        articleTags={[product.title, "SNM Jewelry", "premium jewelry"]}
        structuredData={{
          "@context": "https://schema.org/",
          "@type": "Product",
          name: product.title,
          image: imageList,
          description: `Buy ${product.title} online at SNM Jewelry Store.`,
          sku: product.SKU,
          brand: { "@type": "Brand", name: "SNM Jewelry" },
          offers: {
            "@type": "Offer",
            url: productUrl,
            priceCurrency: "INR",
            price: product.price,
            availability:
              product.stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            seller: { "@type": "Organization", name: "SNM Jewelry Store" },
          },
        }}
      />

      <div className="pdp-page">
        {/* Mobile Image Gallery */}
        <div className="pdp-mobile-gallery">
          <div className="pdp-image-slider" ref={imageContainerRef}>
            <img src={mainImage} alt={product.title} className="pdp-main-image" />

            {/* Badges */}
            <div className="pdp-image-badges">
              {product.isTrending && <span className="pdp-badge trending">🔥 TRENDING</span>}
              {product.isFeatured && <span className="pdp-badge featured">⭐ FEATURED</span>}
            </div>

            {/* Wishlist Button */}
            <button
              className={`pdp-wishlist-float ${wishlisting ? 'loading' : ''}`}
              onClick={handleAddToWishlist}
              disabled={wishlisting}
              aria-label="Add to wishlist"
            >
              ♥
            </button>
          </div>

          {/* Image Dots Indicator */}
          {imageList.length > 1 && (
            <div className="pdp-image-dots">
              {imageList.map((_, index) => (
                <button
                  key={index}
                  className={`pdp-dot ${currentImageIndex === index ? 'active' : ''}`}
                  onClick={() => handleImageChange(index)}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Thumbnail Strip */}
          <div className="pdp-thumbnail-strip">
            {imageList.map((img, i) => (
              <button
                key={i}
                className={`pdp-thumb ${currentImageIndex === i ? 'active' : ''}`}
                onClick={() => handleImageChange(i)}
              >
                <img src={img} alt={`${product.title} view ${i + 1}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="pdp-desktop-container">
          {/* Desktop Image Section */}
          <div className="pdp-desktop-images">
            <div className="pdp-desktop-thumbs">
              {imageList.map((img, i) => (
                <button
                  key={i}
                  className={`pdp-thumb ${selectedImage === img ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={img} alt={`${product.title} view ${i + 1}`} />
                </button>
              ))}
            </div>
            <div className="pdp-desktop-main-image">
              <img src={mainImage} alt={product.title} />
              <div className="pdp-image-badges">
                {product.isTrending && <span className="pdp-badge trending">🔥 TRENDING</span>}
                {product.isFeatured && <span className="pdp-badge featured">⭐ FEATURED</span>}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="pdp-info">
            {/* Meta Tags */}
            {(product.brand || product.collectionId) && (
              <div className="pdp-meta-tags">
                {product.brand && <span className="pdp-brand">{product.brand}</span>}
                {product.collectionId && (
                  <span className="pdp-collection">{product.collectionId.name}</span>
                )}
              </div>
            )}

            {/* Title */}
            <h1 className="pdp-title">{product.title}</h1>

            {/* Rating */}
            {product.rating !== undefined && (
              <div className="pdp-rating">
                <div className="pdp-stars">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.floor(product.rating || 0) ? 'filled' : ''}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="pdp-rating-value">{product.rating.toFixed(1)}</span>
                {product.reviewCount !== undefined && (
                  <button
                    className="pdp-review-link"
                    onClick={() => {
                      const reviewsSection = document.getElementById('product-reviews-section');
                      if (reviewsSection) {
                        reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                  >
                    ({product.reviewCount} reviews)
                  </button>
                )}
                {product.salesCount !== undefined && (
                  <span className="pdp-sales">• {product.salesCount} sold</span>
                )}
              </div>
            )}

            {/* Price */}
            <div className="pdp-price-box">
              <div className="pdp-price-main">
                <span className="pdp-currency">₹</span>
                <span className="pdp-amount">{product.price.toLocaleString('en-IN')}</span>
              </div>
              {product.oldPrice && (
                <div className="pdp-price-old">
                  <span className="pdp-old-price">₹{product.oldPrice.toLocaleString('en-IN')}</span>
                  <span className="pdp-discount">
                    {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
                  </span>
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className={`pdp-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stock > 0 ? (
                <>
                  <span className="pdp-stock-dot"></span>
                  {product.stock} in stock
                </>
              ) : (
                <>
                  <span className="pdp-stock-dot"></span>
                  Out of stock
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="pdp-description">
                <p className={showFullDescription ? 'expanded' : ''}>
                  {product.description}
                </p>
                {product.description.length > 150 && (
                  <button
                    className="pdp-read-more"
                    onClick={() => setShowFullDescription(!showFullDescription)}
                  >
                    {showFullDescription ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            )}

            {/* Details Grid */}
            <div className="pdp-details-grid">
              <div className="pdp-detail-item">
                <span className="pdp-detail-label">SKU</span>
                <span className="pdp-detail-value">{product.SKU}</span>
              </div>
              {product.brand && (
                <div className="pdp-detail-item">
                  <span className="pdp-detail-label">Brand</span>
                  <span className="pdp-detail-value">{product.brand}</span>
                </div>
              )}
              {product.collectionId && (
                <div className="pdp-detail-item">
                  <span className="pdp-detail-label">Collection</span>
                  <span className="pdp-detail-value">{product.collectionId.name}</span>
                </div>
              )}
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="pdp-option-group">
                <label className="pdp-option-label">Color</label>
                <div className="pdp-colors">
                  {product.colors.map((c, i) => (
                    <button key={i} className="pdp-color-swatch" style={{ background: c }} title={c} />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="pdp-option-group">
                <label className="pdp-option-label">Size</label>
                <div className="pdp-sizes">
                  {product.sizes.map((s, i) => (
                    <button key={i} className="pdp-size-btn">{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="pdp-qty-section">
              <label className="pdp-option-label">Quantity</label>
              <div className="pdp-qty-row">
                <div className="pdp-qty-control">
                  <button
                    className="pdp-qty-btn"
                    onClick={decQty}
                    disabled={qty <= 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="pdp-qty-value">{qty}</span>
                  <button
                    className="pdp-qty-btn"
                    onClick={incQty}
                    disabled={product.stock ? qty >= product.stock : false}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <span className="pdp-total">Total: ₹{(product.price * qty).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Desktop Action Buttons */}
            <div className="pdp-desktop-actions">
              <button
                className={`pdp-btn-cart ${adding ? 'loading' : ''}`}
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
              >
                <span className="pdp-btn-icon">🛒</span>
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                className="pdp-btn-buy"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
              >
                <span className="pdp-btn-icon">⚡</span>
                Buy Now
              </button>
              <button
                className={`pdp-btn-wishlist ${wishlisting ? 'loading' : ''}`}
                onClick={handleAddToWishlist}
                disabled={wishlisting}
                aria-label="Add to wishlist"
              >
                ♥
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pdp-trust-badges">
              <div className="pdp-trust-item">
                <span className="pdp-trust-icon">🚚</span>
                <div className="pdp-trust-text">
                  <strong>Free Delivery</strong>
                  <span>3-6 days in India</span>
                </div>
              </div>
              <div className="pdp-trust-item">
                <span className="pdp-trust-icon">🔄</span>
                <div className="pdp-trust-text">
                  <strong>Easy Returns</strong>
                  <span>30-day policy</span>
                </div>
              </div>
              <div className="pdp-trust-item">
                <span className="pdp-trust-icon">🔒</span>
                <div className="pdp-trust-text">
                  <strong>Secure Payment</strong>
                  <span>100% secure</span>
                </div>
              </div>
              <div className="pdp-trust-item">
                <span className="pdp-trust-icon">💎</span>
                <div className="pdp-trust-text">
                  <strong>Certified</strong>
                  <span>Authentic jewelry</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Fixed Bottom Bar */}
        <div className="pdp-mobile-bottom-bar">
          <div className="pdp-mobile-price">
            <span className="pdp-mobile-price-label">Total</span>
            <span className="pdp-mobile-price-value">₹{(product.price * qty).toLocaleString('en-IN')}</span>
          </div>
          <div className="pdp-mobile-actions">
            <button
              className={`pdp-mobile-cart ${adding ? 'loading' : ''}`}
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
            >
              {adding ? '...' : '🛒'}
            </button>
            <button
              className="pdp-mobile-buy"
              onClick={handleBuyNow}
              disabled={product.stock === 0}
            >
              Buy Now
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        <ProductReviews
          productId={product._id}
          productTitle={product.title}
          userHasOrdered={userHasOrdered}
        />
      </div>

      <style jsx>{`
        /* ========== Base Styles ========== */
        .pdp-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
          padding-bottom: 100px;
        }

        /* ========== Mobile Gallery ========== */
        .pdp-mobile-gallery {
          display: none;
        }

        /* ========== Desktop Container ========== */
        .pdp-desktop-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
        }

        /* ========== Desktop Images ========== */
        .pdp-desktop-images {
          display: flex;
          gap: 20px;
          position: sticky;
          top: 100px;
          height: fit-content;
        }

        .pdp-desktop-thumbs {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pdp-thumb {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          overflow: hidden;
          border: 3px solid transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #f8f8f8;
          padding: 0;
        }

        .pdp-thumb:hover,
        .pdp-thumb.active {
          border-color: #FFD700;
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
        }

        .pdp-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .pdp-desktop-main-image {
          flex: 1;
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          background: #f8f8f8;
        }

        .pdp-desktop-main-image img {
          width: 100%;
          height: auto;
          max-height: 700px;
          object-fit: contain;
        }

        /* ========== Badges ========== */
        .pdp-image-badges {
          position: absolute;
          top: 16px;
          left: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .pdp-badge {
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .pdp-badge.trending {
          background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
          color: #fff;
        }

        .pdp-badge.featured {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          color: #000;
        }

        /* ========== Product Info ========== */
        .pdp-info {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .pdp-meta-tags {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pdp-brand {
          background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
          color: #FFD700;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .pdp-collection {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          color: #000;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .pdp-title {
          font-size: 36px;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0;
          line-height: 1.2;
          font-family: 'Georgia', serif;
        }

        /* ========== Rating ========== */
        .pdp-rating {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pdp-stars {
          display: flex;
          gap: 2px;
        }

        .pdp-stars span {
          font-size: 20px;
          color: #ddd;
        }

        .pdp-stars span.filled {
          color: #FFD700;
        }

        .pdp-rating-value {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .pdp-review-link {
          background: none;
          border: none;
          color: #666;
          font-size: 14px;
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
        }

        .pdp-sales {
          color: #666;
          font-size: 14px;
        }

        /* ========== Price ========== */
        .pdp-price-box {
          background: linear-gradient(135deg, #f8f8f8 0%, #fff5e6 100%);
          padding: 20px;
          border-radius: 12px;
          border: 2px solid #FFD700;
        }

        .pdp-price-main {
          display: flex;
          align-items: flex-start;
          gap: 4px;
        }

        .pdp-currency {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
          margin-top: 4px;
        }

        .pdp-amount {
          font-size: 48px;
          font-weight: 900;
          color: #1a1a1a;
          line-height: 1;
        }

        .pdp-price-old {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 8px;
        }

        .pdp-old-price {
          font-size: 18px;
          color: #999;
          text-decoration: line-through;
        }

        .pdp-discount {
          background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
          color: #fff;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
        }

        /* ========== Stock Status ========== */
        .pdp-stock {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
        }

        .pdp-stock-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .pdp-stock.in-stock {
          color: #22c55e;
        }

        .pdp-stock.in-stock .pdp-stock-dot {
          background: #22c55e;
        }

        .pdp-stock.out-of-stock {
          color: #ef4444;
        }

        .pdp-stock.out-of-stock .pdp-stock-dot {
          background: #ef4444;
        }

        /* ========== Description ========== */
        .pdp-description {
          background: #f9f9f9;
          padding: 16px;
          border-radius: 12px;
          border-left: 4px solid #FFD700;
        }

        .pdp-description p {
          margin: 0;
          font-size: 15px;
          line-height: 1.6;
          color: #444;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .pdp-description p.expanded {
          -webkit-line-clamp: unset;
        }

        .pdp-read-more {
          background: none;
          border: none;
          color: #FFD700;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          margin-top: 8px;
          font-size: 14px;
        }

        /* ========== Details Grid ========== */
        .pdp-details-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .pdp-detail-item {
          background: #f9f9f9;
          padding: 12px;
          border-radius: 8px;
        }

        .pdp-detail-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .pdp-detail-value {
          font-size: 14px;
          font-weight: 700;
          color: #1a1a1a;
        }

        /* ========== Options ========== */
        .pdp-option-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .pdp-option-label {
          font-size: 14px;
          font-weight: 700;
          color: #1a1a1a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .pdp-colors {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pdp-color-swatch {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid #ddd;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pdp-color-swatch:hover {
          border-color: #FFD700;
          transform: scale(1.1);
        }

        .pdp-sizes {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pdp-size-btn {
          min-width: 50px;
          padding: 10px 16px;
          border: 2px solid #ddd;
          background: #fff;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pdp-size-btn:hover {
          border-color: #FFD700;
          background: #fff5e6;
        }

        /* ========== Quantity ========== */
        .pdp-qty-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .pdp-qty-row {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .pdp-qty-control {
          display: flex;
          align-items: center;
          border: 2px solid #ddd;
          border-radius: 12px;
          overflow: hidden;
        }

        .pdp-qty-btn {
          width: 48px;
          height: 48px;
          border: none;
          background: #f8f8f8;
          font-size: 24px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #1a1a1a;
        }

        .pdp-qty-btn:hover:not(:disabled) {
          background: #FFD700;
        }

        .pdp-qty-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .pdp-qty-value {
          min-width: 60px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
          background: #fff;
        }

        .pdp-total {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
        }

        /* ========== Desktop Actions ========== */
        .pdp-desktop-actions {
          display: grid;
          grid-template-columns: 1fr 1fr auto;
          gap: 12px;
        }

        .pdp-btn-cart,
        .pdp-btn-buy {
          padding: 16px 24px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-transform: uppercase;
        }

        .pdp-btn-cart {
          background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
          color: #fff;
        }

        .pdp-btn-cart:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .pdp-btn-buy {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          color: #000;
        }

        .pdp-btn-buy:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 215, 0, 0.4);
        }

        .pdp-btn-wishlist {
          width: 56px;
          height: 56px;
          border: 2px solid #FF6B6B;
          background: #fff;
          color: #FF6B6B;
          border-radius: 12px;
          font-size: 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pdp-btn-wishlist:hover:not(:disabled) {
          background: #FF6B6B;
          color: #fff;
        }

        .pdp-btn-cart:disabled,
        .pdp-btn-buy:disabled,
        .pdp-btn-wishlist:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pdp-btn-icon {
          font-size: 18px;
        }

        /* ========== Trust Badges ========== */
        .pdp-trust-badges {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          padding: 20px;
          background: linear-gradient(135deg, #f8f8f8 0%, #fff5e6 100%);
          border-radius: 12px;
        }

        .pdp-trust-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .pdp-trust-icon {
          font-size: 24px;
        }

        .pdp-trust-text {
          display: flex;
          flex-direction: column;
        }

        .pdp-trust-text strong {
          font-size: 13px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .pdp-trust-text span {
          font-size: 12px;
          color: #666;
        }

        /* ========== Mobile Bottom Bar ========== */
        .pdp-mobile-bottom-bar {
          display: none;
        }

        /* ========== Mobile Styles ========== */
        @media (max-width: 968px) {
          .pdp-desktop-container {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .pdp-desktop-images {
            position: relative;
            top: 0;
          }

          .pdp-desktop-actions {
            grid-template-columns: 1fr 1fr;
          }

          .pdp-btn-wishlist {
            grid-column: span 2;
            width: 100%;
          }
        }

        @media (max-width: 768px) {
          .pdp-page {
            padding-bottom: calc(80px + env(safe-area-inset-bottom, 20px) + 70px);
          }

          /* Show Mobile Gallery */
          .pdp-mobile-gallery {
            display: block;
          }

          /* Hide Desktop Elements */
          .pdp-desktop-images {
            display: none !important;
          }

          .pdp-desktop-actions {
            display: none !important;
          }

          .pdp-desktop-container {
            padding: 0;
          }

          /* Mobile Gallery Styles */
          .pdp-image-slider {
            position: relative;
            width: 100%;
            aspect-ratio: 1;
            background: #f8f8f8;
          }

          .pdp-main-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .pdp-wishlist-float {
            position: absolute;
            top: 16px;
            right: 16px;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.95);
            border: none;
            color: #FF6B6B;
            font-size: 22px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .pdp-wishlist-float.loading {
            opacity: 0.5;
          }

          .pdp-image-dots {
            display: flex;
            justify-content: center;
            gap: 8px;
            padding: 12px;
          }

          .pdp-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            border: none;
            background: #ddd;
            cursor: pointer;
            padding: 0;
            transition: all 0.3s ease;
          }

          .pdp-dot.active {
            background: #FFD700;
            width: 24px;
            border-radius: 4px;
          }

          .pdp-thumbnail-strip {
            display: flex;
            gap: 8px;
            padding: 0 16px 16px;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .pdp-thumbnail-strip::-webkit-scrollbar {
            display: none;
          }

          .pdp-thumbnail-strip .pdp-thumb {
            width: 60px;
            height: 60px;
            flex-shrink: 0;
            border-width: 2px;
          }

          /* Mobile Info */
          .pdp-info {
            padding: 0 16px;
            gap: 16px;
          }

          .pdp-title {
            font-size: 22px;
          }

          .pdp-rating {
            gap: 8px;
          }

          .pdp-stars span {
            font-size: 16px;
          }

          .pdp-rating-value {
            font-size: 15px;
          }

          .pdp-review-link,
          .pdp-sales {
            font-size: 13px;
          }

          .pdp-price-box {
            padding: 16px;
          }

          .pdp-currency {
            font-size: 18px;
          }

          .pdp-amount {
            font-size: 36px;
          }

          .pdp-old-price {
            font-size: 16px;
          }

          .pdp-details-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .pdp-qty-control {
            flex: 1;
          }

          .pdp-qty-btn {
            width: 44px;
            height: 44px;
            font-size: 20px;
          }

          .pdp-qty-value {
            min-width: 50px;
            height: 44px;
            font-size: 16px;
          }

          .pdp-total {
            font-size: 16px;
          }

          .pdp-trust-badges {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            padding: 16px;
          }

          .pdp-trust-icon {
            font-size: 20px;
          }

          .pdp-trust-text strong {
            font-size: 12px;
          }

          .pdp-trust-text span {
            font-size: 11px;
          }

          /* Mobile Bottom Bar */
          .pdp-mobile-bottom-bar {
            display: flex;
            position: fixed;
            bottom: calc(60px + env(safe-area-inset-bottom, 0px));
            left: 0;
            right: 0;
            background: #fff;
            padding: 12px 16px;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
            z-index: 100;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
          }

          .pdp-mobile-price {
            display: flex;
            flex-direction: column;
          }

          .pdp-mobile-price-label {
            font-size: 12px;
            color: #666;
          }

          .pdp-mobile-price-value {
            font-size: 20px;
            font-weight: 800;
            color: #1a1a1a;
          }

          .pdp-mobile-actions {
            display: flex;
            gap: 10px;
            flex: 1;
            max-width: 240px;
          }

          .pdp-mobile-cart {
            width: 50px;
            height: 50px;
            border-radius: 12px;
            border: 2px solid #1a1a1a;
            background: #fff;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .pdp-mobile-cart.loading {
            opacity: 0.5;
          }

          .pdp-mobile-buy {
            flex: 1;
            height: 50px;
            border: none;
            border-radius: 12px;
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            color: #000;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            text-transform: uppercase;
          }

          .pdp-mobile-cart:disabled,
          .pdp-mobile-buy:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }

        @media (max-width: 480px) {
          .pdp-title {
            font-size: 20px;
          }

          .pdp-amount {
            font-size: 32px;
          }

          .pdp-currency {
            font-size: 16px;
          }

          .pdp-details-grid {
            grid-template-columns: 1fr;
          }

          .pdp-trust-badges {
            grid-template-columns: 1fr;
          }

          .pdp-meta-tags {
            gap: 6px;
          }

          .pdp-brand,
          .pdp-collection {
            padding: 4px 10px;
            font-size: 10px;
          }
        }

        /* Loading Animation */
        .loading {
          position: relative;
          pointer-events: none;
        }

        .loading::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 16px;
          height: 16px;
          margin: -8px 0 0 -8px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
};

export default ProductDetail;
