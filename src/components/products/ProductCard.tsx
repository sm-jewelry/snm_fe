import React from 'react';
import { useRouter } from 'next/router';

interface ProductCardProps {
  product: {
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
  };
  showBadges?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, showBadges = true }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/products/${product._id}`);
  };

  return (
    <div className="product-card" onClick={handleClick}>
      {/* Badges */}
      {showBadges && (
        <div className="product-badges">
          {product.isTrending && (
            <span className="badge badge-trending">🔥 TRENDING</span>
          )}
          {product.isFeatured && (
            <span className="badge badge-featured">⭐ FEATURED</span>
          )}
          {product.rating && product.rating >= 4.5 && (
            <span className="badge badge-rating">
              ⭐ {product.rating.toFixed(1)}
            </span>
          )}
        </div>
      )}

      {/* Product Image */}
      <div className="product-image">
        <img src={product.URL} alt={product.title} />
        <div className="product-overlay">
          <button className="quick-view-btn">Quick View</button>
        </div>
      </div>

      {/* Product Info */}
      <div className="product-info">
        {product.brand && (
          <p className="product-brand">{product.brand}</p>
        )}
        <h3 className="product-title">{product.title}</h3>

        <div className="product-rating">
          {product.rating && product.rating > 0 ? (
            <>
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.floor(product.rating!) ? 'star filled' : 'star'}>
                    ★
                  </span>
                ))}
              </div>
              {product.reviewCount && product.reviewCount > 0 && (
                <span className="review-count">({product.reviewCount})</span>
              )}
            </>
          ) : (
            <span className="no-rating">New Arrival</span>
          )}
        </div>

        <div className="product-price">
          <span className="currency">₹</span>
          <span className="amount">{product.price.toLocaleString('en-IN')}</span>
        </div>

        {product.salesCount && product.salesCount > 0 && (
          <p className="product-sales">{product.salesCount} sold</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
