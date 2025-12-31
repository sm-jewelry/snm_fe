"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import ProductCard from "../../components/products/ProductCard";

interface Product {
  _id: string;
  title: string;
  price: number;
  URL: string;
  SKU?: string;
  stock?: number;
  rating?: number;
  reviewCount?: number;
  sales?: number;
  isTrending?: boolean;
  isFeatured?: boolean;
}

interface Category {
  _id: string;
  name: string;
  description?: string;
}

// ✅ Use API Gateway URL
const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

// Dummy products for Silver & Gemstone category
const silverGemstoneDummyProducts: Product[] = [
  {
    _id: "sg001",
    title: "Sterling Silver Amethyst Pendant Necklace",
    price: 4500,
    URL: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500",
    SKU: "SG-AME-001",
    stock: 15,
    rating: 4.8,
    reviewCount: 24,
    sales: 89,
    isTrending: true,
    isFeatured: true,
  },
  {
    _id: "sg002",
    title: "Emerald & Silver Ring",
    price: 6200,
    URL: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500",
    SKU: "SG-EME-002",
    stock: 8,
    rating: 4.9,
    reviewCount: 31,
    sales: 67,
    isFeatured: true,
  },
  {
    _id: "sg003",
    title: "Ruby Silver Earrings",
    price: 5800,
    URL: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500",
    SKU: "SG-RUB-003",
    stock: 12,
    rating: 4.7,
    reviewCount: 19,
    sales: 54,
  },
  {
    _id: "sg004",
    title: "Sapphire Silver Bracelet",
    price: 7500,
    URL: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500",
    SKU: "SG-SAP-004",
    stock: 6,
    rating: 5.0,
    reviewCount: 42,
    sales: 103,
    isTrending: true,
  },
  {
    _id: "sg005",
    title: "Moonstone Silver Pendant",
    price: 3900,
    URL: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500",
    SKU: "SG-MOO-005",
    stock: 20,
    rating: 4.6,
    reviewCount: 16,
    sales: 38,
  },
  {
    _id: "sg006",
    title: "Topaz Silver Cocktail Ring",
    price: 8200,
    URL: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500",
    SKU: "SG-TOP-006",
    stock: 5,
    rating: 4.9,
    reviewCount: 28,
    sales: 76,
    isFeatured: true,
  },
  {
    _id: "sg007",
    title: "Garnet Silver Drop Earrings",
    price: 4800,
    URL: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=500",
    SKU: "SG-GAR-007",
    stock: 14,
    rating: 4.8,
    reviewCount: 22,
    sales: 61,
  },
  {
    _id: "sg008",
    title: "Peridot Silver Cuff Bracelet",
    price: 6800,
    URL: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500",
    SKU: "SG-PER-008",
    stock: 9,
    rating: 4.7,
    reviewCount: 18,
    sales: 45,
    isTrending: true,
  },
  {
    _id: "sg009",
    title: "Citrine Silver Statement Necklace",
    price: 9500,
    URL: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=500",
    SKU: "SG-CIT-009",
    stock: 4,
    rating: 5.0,
    reviewCount: 35,
    sales: 92,
    isFeatured: true,
  },
  {
    _id: "sg010",
    title: "Aquamarine Silver Stud Earrings",
    price: 3500,
    URL: "https://images.unsplash.com/photo-1611955167811-4711904bb9f6?w=500",
    SKU: "SG-AQU-010",
    stock: 25,
    rating: 4.6,
    reviewCount: 14,
    sales: 41,
  },
  {
    _id: "sg011",
    title: "Tanzanite Silver Pendant Set",
    price: 11200,
    URL: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500",
    SKU: "SG-TAN-011",
    stock: 3,
    rating: 5.0,
    reviewCount: 47,
    sales: 118,
    isTrending: true,
    isFeatured: true,
  },
  {
    _id: "sg012",
    title: "Opal Silver Stackable Rings",
    price: 5200,
    URL: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500",
    SKU: "SG-OPA-012",
    stock: 18,
    rating: 4.8,
    reviewCount: 26,
    sales: 73,
  },
];

const CategoryPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch category details
        const catRes = await fetch(`${API_GATEWAY_URL}/api/categories/${id}`, {
          credentials: 'include',
        });
        const catData = await catRes.json();
        setCategory(catData);

        // Fetch products
        const res = await fetch(`${API_GATEWAY_URL}/api/categories/${id}/products`, {
          credentials: 'include',
        });
        const data = await res.json();

        // If category is "Silver and Gemstone" and no products, use dummy data
        if (
          (!data.data || data.data.length === 0) &&
          catData.name?.toLowerCase().includes("silver") &&
          catData.name?.toLowerCase().includes("gemstone")
        ) {
          setProducts(silverGemstoneDummyProducts);
        } else {
          setProducts(data.data || []);
        }
      } catch (err: any) {
        console.error("Failed to fetch data:", err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "popularity":
        return (b.sales || 0) - (a.sales || 0);
      default:
        return 0;
    }
  });

  if (loading)
    return <p className="p-6 text-center text-gray-600">Loading products...</p>;

  if (error)
    return (
      <p className="p-6 text-center text-red-600">
        ⚠️ {error}
      </p>
    );

  if (!products.length)
    return (
      <p className="p-6 text-center text-gray-600">
        No products found in this category.
      </p>
    );

  return (
    <div className="category-products-page">
      <div className="page-container">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <Link href="/">Home</Link>
          <span className="separator">/</span>
          <Link href="/shop">Shop</Link>
          <span className="separator">/</span>
          <span className="current">{category?.name || "Category"}</span>
        </div>

        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">
            <span className="page-title-icon">💎</span>
            {category?.name || "Category Products"}
          </h1>
          {category?.description && (
            <p className="page-subtitle">{category.description}</p>
          )}
        </div>

        {/* Filters & Sort */}
        <div className="controls" style={{ maxWidth: '1400px', margin: '0 auto 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '16px', color: '#666' }}>
              Showing {sortedProducts.length} products
            </span>
          </div>
          <div className="sort">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '12px 20px', borderRadius: '8px', border: '2px solid #e5e5e5', fontSize: '14px', fontWeight: '600' }}
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popularity">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-container">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              showBadges={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;