import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';

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
}

interface CollectionWithProducts {
  collection: {
    _id: string;
    name: string;
    description: string;
    imageUrl: string;
  };
  products: Product[];
}

const TrendingProducts: React.FC = () => {
  const [data, setData] = useState<CollectionWithProducts[]>([]);
  const [loading, setLoading] = useState(true);

  const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

  useEffect(() => {
    fetch(`${API_GATEWAY_URL}/api/trending/by-collection`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setData(data);
        } else {
          console.error('Expected array but got:', data);
          setData([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading trending products:', err);
        setData([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="trending-section">
        <div className="trending-loading">
          <p>Loading latest trends...</p>
        </div>
      </section>
    );
  }

  if (data.length === 0) {
    return null;
  }

  return (
    <section className="trending-section">
      <div className="trending-header">
        <h2 className="section-title">Latest Trending Jewelry</h2>
        <p className="section-subtitle">Discover our most sought-after pieces</p>
      </div>

      <div className="trending-collections">
        {data.map((item) => (
          <div key={item.collection._id} className="collection-group">
            <div className="collection-header">
              <div className="collection-title-group">
                <h3 className="collection-title">{item.collection.name}</h3>
                <p className="collection-description">{item.collection.description}</p>
              </div>
              <a href={`/collections/${item.collection._id}`} className="view-all-link">
                View All →
              </a>
            </div>

            <div className="products-grid">
              {item.products.map((product) => (
                <ProductCard key={product._id} product={product} showBadges={true} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrendingProducts;
