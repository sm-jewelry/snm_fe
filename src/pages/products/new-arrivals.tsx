import React, { useEffect, useState } from "react";
import Link from "next/link";
import Seo from "../../components/common/Seo";
import { useRouter } from "next/router";

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

const NewArrivals: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const CATEGORY_API = process.env.NEXT_PUBLIC_CATEGORY_API_BASE_URL;
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetch(`${CATEGORY_API}/api/new-arrivals`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setLoading(false);
      });
  }, [CATEGORY_API]);

  // ✅ Add to Cart
  const handleAddToCart = async (product: Product) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Please login to continue");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/cart/add`, {
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
          quantity: 1,
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
    }
  };

  // ✅ Add to Wishlist
  const handleAddToWishlist = async (product: Product) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Please login to continue");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/wishlist/add`, {
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
      alert("Something went wrong.");
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
        <div className="new-arrivals-hero">
          <h1>New Arrival</h1>
          <p>Shop through our latest selection of Fashion</p>
        </div>

        {/* Sort/Filter Controls */}
        <div className="controls">
          <button className="filter-btn">⚙ FILTER</button>
          <div className="sort">
            <select>
              <option>Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <div key={product._id} className="product-card">
                <div className="image-wrapper">
                  <Link href={`/products/${product._id}`}>
                    <img src={product.URL} alt={product.title} className="product-img" />
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

                <Link href={`/products/${product._id}`} className="product-info">
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
