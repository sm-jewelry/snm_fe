"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

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

// ✅ Use API Gateway URL
const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

const CollectionProductsPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [collectionName, setCollectionName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Fetch collection details
        const colRes = await fetch(`${API_GATEWAY_URL}/api/collections/${id}`, {
          credentials: 'include', // Important for API Gateway
        });
        const colData = await colRes.json();
        setCollectionName(colData.name || "Collection");
        
        // Fetch products in collection
        const res = await fetch(`${API_GATEWAY_URL}/api/catalogs/collection/${id}`, {
          credentials: 'include', // Important for API Gateway
        });
        const data = await res.json();
        setProducts(data || []);
      } catch (err) {
        console.error("Error fetching collection products:", err);
        alert("Failed to fetch collection products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [id]);

  const handleAddToCart = async (product: Product) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Please login to continue");
      router.push("/profile");
      return;
    }

    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include', // Important for API Gateway
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

  const handleAddToWishlist = async (product: Product) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Please login to continue");
      router.push("/profile");
      return;
    }

    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/wishlist/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include', // Important for API Gateway
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
      console.error("Wishlist Error:", err);
      alert("Something went wrong adding to wishlist.");
    }
  };

  if (loading)
    return <p className="text-center p-6">Loading collection products...</p>;

  if (!products.length)
    return (
      <p className="text-center p-6">
        No products found in "{collectionName}" collection.
      </p>
    );

  return (
    <section style={{ padding: "40px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        {collectionName || "Collection"} Products
      </h1>

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

              <Link href={`collectionproducts/${product._id}`} className="product-info">
                <h3>{product.title}</h3>
                <p>₹{product.price}</p>
                <p className="sku">SKU: {product.SKU}</p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CollectionProductsPage;