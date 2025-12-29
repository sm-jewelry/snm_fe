import React, { useEffect, useState } from 'react';
import ProductCard from '../components/products/ProductCard';

interface Product {
  _id: string;
  title: string;
  price: number;
  URL: string;
  rating?: number;
  reviewCount?: number;
  SKU?: string;
  stock?: number;
}

export default function TopRatedPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

  useEffect(() => {
    fetch(`${API_GATEWAY_URL}/api/top-rated?minRating=4.0`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        // Ensure data is an array
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error('Expected array but got:', data);
          setProducts([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading top rated products:', err);
        setProducts([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="top-rated-page">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2>Loading top rated jewelry...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="top-rated-page">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">
            <span className="page-title-icon">⭐</span>
            Top Rated
          </h1>
          <p className="page-subtitle">Highest rated by our valued customers</p>
        </div>

        {products.length === 0 ? (
          <p className="no-products">No top rated products available yet.</p>
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
