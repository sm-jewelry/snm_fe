import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Seo from "../../../components/common/Seo";

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
}

const CATEGORY_API = process.env.NEXT_PUBLIC_CATEGORY_API_BASE_URL;
const MAIN_API = process.env.NEXT_PUBLIC_API_BASE_URL;

const ProductDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [qty, setQty] = useState<number>(1);
  const [adding, setAdding] = useState(false);
  const [wishlisting, setWishlisting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${CATEGORY_API}/api/products/${id}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch product");

        setProduct(data);
        setSelectedImage(data?.URL || null);
        setQty(1);
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <p className="text-center p-6">Loading...</p>;
  if (!product) return <p className="text-center p-6">Product not found</p>;

  const productUrl = `${process.env.NEXT_PUBLIC_LOGIN_FRONTEND_URL}/products/${product._id}`;
  const imageList = [product.URL, ...(product.images || [])];
  const mainImage = selectedImage || imageList[0];

  const incQty = () =>
    setQty((prev) => (product.stock ? Math.min(prev + 1, product.stock) : prev + 1));
  const decQty = () => setQty((prev) => Math.max(1, prev - 1));

  const handleAddToCart = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Please login to continue");
      router.push("/login");
      return;
    }

    setAdding(true);
    try {
      const res = await fetch(`${MAIN_API}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
        alert("✅ Product added to cart successfully!");
        window.dispatchEvent(new CustomEvent("cartUpdated"));
      } else {
        alert(data.message || "❌ Failed to add to cart");
      }
    } catch (err) {
      console.error("Cart Add Error:", err);
      alert("Something went wrong while adding to cart.");
    } finally {
      setAdding(false);
    }
  };

  const handleAddToWishlist = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Please login to continue");
      router.push("/login");
      return;
    }

    setWishlisting(true);
    try {
      const res = await fetch(`${MAIN_API}/api/wishlist/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product._id }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Added to wishlist!");
        window.dispatchEvent(new CustomEvent("wishlistUpdated"));
      } else {
        alert(data.message || "❌ Failed to add to wishlist");
      }
    } catch (err) {
      console.error("Wishlist Add Error:", err);
      alert("Something went wrong adding to wishlist.");
    } finally {
      setWishlisting(false);
    }
  };

  const handleBuyNow = () => {
    const orderData = {
      productId: product._id,
      title: product.title,
      price: product.price,
      image: product.URL,
      quantity: qty,
      total: product.price * qty,
      SKU: product.SKU,
    };
    localStorage.setItem("checkoutItem", JSON.stringify(orderData));
    router.push("/checkout");
  };

  return (
    <>
      <Seo
        title={`${product.title} - Buy Online | NQD Fashion Store`}
        description={`Buy ${product.title} at just ₹${product.price}. ${
          product.stock > 0 ? "In stock now!" : "Currently out of stock."
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

      <div className="product-detail">
        {/* Left: Image gallery */}
        <div className="images">
          <div className="thumbnails">
            {imageList.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={product.title}
                className={selectedImage === img ? "active" : ""}
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>

          <div className="main-image">
            <img src={mainImage} alt={product.title} />
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="info">
          <h1>{product.title}</h1>

          <div className="price">
            <span className="current">₹{product.price}</span>
            {product.oldPrice && <span className="old">₹{product.oldPrice}</span>}
            {product.oldPrice && (
              <span className="discount">
                {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
              </span>
            )}
          </div>

          <p className="sku">SKU: {product.SKU}</p>
          <p className="stock">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          {/* Colors */}
          {product.colors && (
            <div className="colors">
              <p>Color:</p>
              <div className="options">
                {product.colors.map((c, i) => (
                  <button key={i} style={{ background: c }} title={c}></button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes && (
            <div className="sizes">
              <p>Size:</p>
              <div className="options">
                {product.sizes.map((s, i) => (
                  <button key={i}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Actions: quantity + main buttons */}
          <div className="actions">
            <div className="actions-row">
              <div className="qty-control" role="group" aria-label="Quantity">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={decQty}
                  disabled={qty <= 1}
                >
                  −
                </button>
                <div className="qty-value">{qty}</div>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={incQty}
                  disabled={product.stock ? qty >= product.stock : false}
                >
                  +
                </button>
              </div>

              <button
                className={`add-to-cart pill-btn ${adding ? "loading" : ""}`}
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
              >
                {adding ? "Adding..." : `Add to cart – ₹${product.price}`}
              </button>

              <div className="icons-right">
                <button
                  className="icon-circle"
                  title="Add to Wishlist"
                  onClick={handleAddToWishlist}
                  disabled={wishlisting}
                >
                  ♥
                </button>

                <button
                  className="icon-circle"
                  title="More actions"
                  onClick={() => {
                    // placeholder for other action (share/compare)
                    alert("More actions");
                  }}
                >
                  ⤢
                </button>
              </div>
            </div>

            <button
              className="buy-now pill-btn buy-now-btn"
              onClick={handleBuyNow}
            >
              BUY IT NOW
            </button>
          </div>

          {/* Delivery info */}
          <div className="delivery">
            <p>
              <strong>Delivery:</strong> 3–6 days in India, 12–26 days International
            </p>
            <p>
              <strong>Return:</strong> Within 30 days of purchase
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
