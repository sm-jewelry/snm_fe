"use client";

import React, { useEffect, useState } from "react";
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
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [wishlisting, setWishlisting] = useState(false);
  const [userHasOrdered, setUserHasOrdered] = useState(false);

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

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found</p>;

  const imageList = [product.URL, ...(product.images || [])];
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
    if (product.stock && qty < product.stock) {
      setQty(qty + 1);
    }
  };

  const decQty = () => {
    if (qty > 1) {
      setQty(qty - 1);
    }
  };

  return (
    <>
      <Seo
        title={`${product.title} - Buy Online | NQD Fashion Store`}
        description={`Buy ${product.title} at just ₹${product.price}. ${product.stock > 0 ? "In stock now!" : "Currently out of stock."
          }`}
        ogTitle={product.title}
        ogDescription={`Shop ${product.title} — available at NQD Fashion Store.`}
        ogType="product"
        ogImage={mainImage}
        canonical={productUrl}
        articleTags={[product.title, "NQD Fashion", "latest fashion"]}
        structuredData={{
          "@context": "https://schema.org/",
          "@type": "Product",
          name: product.title,
          image: imageList,
          description: `Buy ${product.title} online at NQD Fashion Store.`,
          sku: product.SKU,
          brand: { "@type": "Brand", name: "NQD Fashion" },
          offers: {
            "@type": "Offer",
            url: productUrl,
            priceCurrency: "INR",
            price: product.price,
            availability:
              product.stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            seller: { "@type": "Organization", name: "NQD Fashion Store" },
          },
        }}
      />

      <div className="product-detail-page">
        <div className="product-detail-container">
          {/* Left: Image gallery */}
          <div className="product-images-section">
            <div className="image-thumbnails">
              {imageList.map((img, i) => (
                <div
                  key={i}
                  className={`thumbnail ${selectedImage === img ? "active" : ""}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={img} alt={`${product.title} view ${i + 1}`} />
                </div>
              ))}
            </div>

            <div className="main-image-container">
              <img src={mainImage} alt={product.title} className="main-product-image" />

              {/* Badges on image */}
              <div className="image-badges">
                {product.isTrending && <span className="badge trending-badge">🔥 TRENDING</span>}
                {product.isFeatured && <span className="badge featured-badge">⭐ FEATURED</span>}
              </div>
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="product-info-section">
            {/* Brand & Collection */}
            {(product.brand || product.collectionId) && (
              <div className="product-meta">
                {product.brand && <span className="brand-name">{product.brand}</span>}
                {product.collectionId && (
                  <span className="collection-name">{product.collectionId.name}</span>
                )}
              </div>
            )}

            {/* Product Title */}
            <h1 className="product-title">{product.title}</h1>

            {/* Rating & Reviews */}
            {product.rating !== undefined && (
              <div className="product-rating">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.floor(product.rating || 0) ? "star filled" : "star"}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="rating-value">{product.rating.toFixed(1)}</span>
                {product.reviewCount !== undefined && (
                  <span
                    className="review-count"
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => {
                      const reviewsSection = document.getElementById('product-reviews-section');
                      if (reviewsSection) {
                        reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                  >
                    ({product.reviewCount} reviews)
                  </span>
                )}
                {product.salesCount !== undefined && (
                  <span className="sales-count">• {product.salesCount} sold</span>
                )}
              </div>
            )}

            {/* Price Section */}
            <div className="price-section">
              <div className="price-main">
                <span className="currency">₹</span>
                <span className="amount">{product.price.toLocaleString('en-IN')}</span>
              </div>
              {product.oldPrice && (
                <div className="price-old-section">
                  <span className="old-price">₹{product.oldPrice.toLocaleString('en-IN')}</span>
                  <span className="discount-badge">
                    {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="product-description">
                <p>{product.description}</p>
              </div>
            )}

            {/* Product Details Grid */}
            <div className="product-details-grid">
              <div className="detail-item">
                <span className="detail-label">SKU</span>
                <span className="detail-value">{product.SKU}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Availability</span>
                <span className={`detail-value ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </span>
              </div>
              {product.brand && (
                <div className="detail-item">
                  <span className="detail-label">Brand</span>
                  <span className="detail-value">{product.brand}</span>
                </div>
              )}
              {product.collectionId && (
                <div className="detail-item">
                  <span className="detail-label">Collection</span>
                  <span className="detail-value">{product.collectionId.name}</span>
                </div>
              )}
            </div>

            {/* Colors */}
            {product.colors && (
              <div className="product-options">
                <label className="option-label">Color:</label>
                <div className="color-options">
                  {product.colors.map((c, i) => (
                    <button key={i} className="color-swatch" style={{ background: c }} title={c}></button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && (
              <div className="product-options">
                <label className="option-label">Size:</label>
                <div className="size-options">
                  {product.sizes.map((s, i) => (
                    <button key={i} className="size-button">{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="quantity-section">
              <label className="option-label">Quantity:</label>
              <div className="quantity-control">
                <button
                  type="button"
                  className="qty-btn qty-minus"
                  onClick={decQty}
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <div className="qty-display">{qty}</div>
                <button
                  type="button"
                  className="qty-btn qty-plus"
                  onClick={incQty}
                  disabled={product.stock ? qty >= product.stock : false}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <span className="total-price">Total: ₹{(product.price * qty).toLocaleString('en-IN')}</span>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                className={`btn-add-cart ${adding ? "loading" : ""}`}
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
              >
                <span className="btn-icon">🛒</span>
                <span className="btn-text">{adding ? "Adding..." : "Add to Cart"}</span>
              </button>

              <button
                className="btn-buy-now"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
              >
                <span className="btn-icon">⚡</span>
                <span className="btn-text">Buy Now</span>
              </button>

              <button
                className={`btn-wishlist ${wishlisting ? "loading" : ""}`}
                title="Add to Wishlist"
                onClick={handleAddToWishlist}
                disabled={wishlisting}
                aria-label="Add to wishlist"
              >
                ♥
              </button>
            </div>

            {/* Delivery & Return Info */}
            <div className="delivery-info">
              <div className="info-card">
                <div className="info-icon">🚚</div>
                <div className="info-content">
                  <h4>Free Delivery</h4>
                  <p>3-6 days in India • 12-26 days International</p>
                </div>
              </div>
              <div className="info-card">
                <div className="info-icon">🔄</div>
                <div className="info-content">
                  <h4>Easy Returns</h4>
                  <p>30-day return policy for hassle-free returns</p>
                </div>
              </div>
              <div className="info-card">
                <div className="info-icon">🔒</div>
                <div className="info-content">
                  <h4>Secure Payment</h4>
                  <p>100% secure payment with trusted gateways</p>
                </div>
              </div>
              <div className="info-card">
                <div className="info-icon">💎</div>
                <div className="info-content">
                  <h4>Authentic Jewelry</h4>
                  <p>Certified and authenticated premium jewelry</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ProductReviews
          productId={product._id}
          productTitle={product.title}
          userHasOrdered={userHasOrdered}
        />
      </div>
    </>
  );
};

export default ProductDetail;