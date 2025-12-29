import React, { useEffect, useState } from 'react';
import ProductCard from '../components/products/ProductCard';

interface Product {
  _id: string;
  title: string;
  price: number;
  URL: string;
  brand?: string;
  isFeatured?: boolean;
  SKU?: string;
  stock?: number;
}

export default function BrandsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

  useEffect(() => {
    fetch(`${API_GATEWAY_URL}/api/brands`, {
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
        console.error('Error loading featured brands:', err);
        setProducts([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="brands-page">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2>Loading featured brands...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="brands-page">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">
            <span className="page-title-icon">💎</span>
            Brands We Love
          </h1>
          <p className="page-subtitle">Curated collection from premium jewelry brands</p>
        </div>

        {products.length === 0 ? (
          <p className="no-products">No featured brands available yet.</p>
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
