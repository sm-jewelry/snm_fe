"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ProductCard from "../../../components/products/ProductCard";
import Seo from "../../../components/common/Seo";

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
  stock?: number;
  SKU?: string;
}

interface Breadcrumb {
  _id: string;
  name: string;
  level: string;
}

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

export default function CategoryProductsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [products, setProducts] = useState<Product[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    // Fetch products and breadcrumbs in parallel
    Promise.all([
      fetch(`${API_GATEWAY_URL}/api/category-products/${id}`, {
        credentials: 'include',
      }).then(res => res.json()),
      fetch(`${API_GATEWAY_URL}/api/category-products/path/${id}`, {
        credentials: 'include',
      }).then(res => res.json()),
    ])
      .then(([productsData, breadcrumbsData]) => {
        if (Array.isArray(productsData)) {
          setProducts(productsData);
        } else {
          console.error('Expected array but got:', productsData);
          setProducts([]);
        }

        if (Array.isArray(breadcrumbsData)) {
          setBreadcrumbs(breadcrumbsData);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading category products:', err);
        setProducts([]);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="category-products-page">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2>Loading products...</h2>
        </div>
      </div>
    );
  }

  const categoryName = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name : 'Category';

  return (
    <>
      <Seo
        title={`${categoryName} - Shop Jewelry | SNM Jewelry`}
        description={`Browse our collection of ${categoryName.toLowerCase()} jewelry. Premium quality jewelry at best prices.`}
      />

      <div className="category-products-page">
        <div className="page-container">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <nav className="breadcrumbs">
              <a href="/">Home</a>
              <span className="separator">›</span>
              <a href="/shop">Shop</a>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb._id}>
                  <span className="separator">›</span>
                  {index === breadcrumbs.length - 1 ? (
                    <span className="current">{crumb.name}</span>
                  ) : (
                    <a href={`/shop/category/${crumb._id}`}>{crumb.name}</a>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}

          {/* Page Header */}
          <div className="page-header">
            <h1 className="page-title">
              <span className="page-title-icon">💎</span>
              {categoryName}
            </h1>
            <p className="page-subtitle">
              {products.length} {products.length === 1 ? 'product' : 'products'} found
            </p>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <p className="no-products">No products available in this category yet.</p>
          ) : (
            <div className="products-container">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} showBadges={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
