import React, { useEffect, useState } from 'react';
import ProductCard from '../components/products/ProductCard';
import styles from '../styles/FindStore.module.css';

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

export default function FindStorePage() {
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
        console.error('Error loading products:', err);
        setProducts([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className={styles.findStorePage}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <h2 className={styles.loadingText}>Discovering Our Finest Pieces...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.findStorePage}>
      {/* Hero Section */}
      <div className={styles.storeHero}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>Premium Collection</div>
          <h1 className={styles.heroTitle}>
            <span className={styles.titleLine}>Discover Excellence</span>
            <span className={`${styles.titleLine} ${styles.gradientText}`}>In Every Piece</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Explore our curated selection of best-selling jewelry, crafted with precision and passion
          </p>
          <div className={styles.heroStats}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{products.length}+</div>
              <div className={styles.statLabel}>Premium Pieces</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>100%</div>
              <div className={styles.statLabel}>Authentic</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>24/7</div>
              <div className={styles.statLabel}>Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className={styles.storeContainer}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>Best Sellers</div>
          <h2 className={styles.sectionTitle}>Our Signature Collection</h2>
          <p className={styles.sectionDescription}>
            Handpicked masterpieces loved by jewelry connoisseurs worldwide
          </p>
        </div>

        {products.length === 0 ? (
          <div className={styles.noProductsContainer}>
            <div className={styles.noProductsIcon}>💎</div>
            <p className={styles.noProductsText}>Our collection is being curated</p>
            <p className={styles.noProductsSubtext}>Check back soon for exclusive pieces</p>
          </div>
        ) : (
          <div className={styles.storeProductsGrid}>
            {products.map((product) => (
              <div key={product._id} className={styles.productWrapper}>
                <ProductCard product={product} showBadges={true} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Store Information Section */}
      <div className={styles.storeInfoSection}>
        <div className={styles.infoContainer}>
          <h2 className={styles.infoTitle}>Visit Our Showroom</h2>
          <p className={styles.infoSubtitle}>Experience luxury in person</p>

          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>📍</div>
              <h3 className={styles.infoCardTitle}>Location</h3>
              <p className={styles.infoCardText}>Coming Soon</p>
              <p className={styles.infoCardSubtext}>Premium showroom locations</p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>⏰</div>
              <h3 className={styles.infoCardTitle}>Hours</h3>
              <p className={styles.infoCardText}>Mon - Sat</p>
              <p className={styles.infoCardSubtext}>10:00 AM - 8:00 PM</p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>📞</div>
              <h3 className={styles.infoCardTitle}>Contact</h3>
              <p className={styles.infoCardText}>Get in Touch</p>
              <p className={styles.infoCardSubtext}>Personal assistance available</p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>🎁</div>
              <h3 className={styles.infoCardTitle}>Services</h3>
              <p className={styles.infoCardText}>Personalization</p>
              <p className={styles.infoCardSubtext}>Custom designs & engraving</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
