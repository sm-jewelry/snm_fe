import React, { useEffect, useState } from 'react';
import ProductCard from '../components/products/ProductCard';

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
}

export default function BestSellersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

  useEffect(() => {
    fetch(`${API_GATEWAY_URL}/api/best-sellers`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error('Expected array but got:', data);
          setProducts([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading best sellers:', err);
        setProducts([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="best-sellers-page">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2>Loading best sellers...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="best-sellers-page">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">
            <span className="page-title-icon">🏆</span>
            Best Sellers
          </h1>
          <p className="page-subtitle">Our most popular jewelry pieces</p>
        </div>

        {products.length === 0 ? (
          <p className="no-products">No best sellers available yet.</p>
        ) : (
          <div className="products-container">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} showBadges={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
