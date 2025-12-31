import React from 'react'
import { useRouter } from 'next/router'
import CircleMenu from '../components/headers/CircleMenu'
import Collections from '../components/collections/Collections'
import TrendingProducts from '../components/products/TrendingProducts'
import Seo from "../components/common/Seo";

const Home: React.FC = () => {
  const router = useRouter();

  return (
    <>
      <Seo
        title="Home - SNM Jewelry"
        description="Discover exquisite jewelry collections at SNM. Shop our latest trending pieces, premium diamonds, and handcrafted gold ornaments."
        ogTitle="Home - SNM Jewelry"
        ogDescription="Discover exquisite jewelry collections at SNM. Shop our latest trending pieces, premium diamonds, and handcrafted gold ornaments."
        ogType="website"
        ogImage='assets/GreeneyeLandscape.png'
      />

      {/* Hero Section */}
      <div className="home-hero">
        <div className="hero-content">
          <span className="hero-badge">✨ Premium Jewelry ✨</span>
          <h1 className="hero-title">Timeless Elegance</h1>
          <p className="hero-subtitle">
            Discover our exquisite collection of handcrafted jewelry that tells your unique story
          </p>
          <div className="hero-cta">
            <button
              className="hero-btn hero-btn-primary"
              onClick={() => router.push('/shop')}
            >
              Shop Collection →
            </button>
            <button
              className="hero-btn hero-btn-secondary"
              onClick={() => router.push('/best')}
            >
              Explore Best Sellers
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="home-features">
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">🚚</div>
            <h3 className="feature-title">Free Shipping</h3>
            <p className="feature-description">
              On all orders over ₹5,000 across India
            </p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">💎</div>
            <h3 className="feature-title">Premium Quality</h3>
            <p className="feature-description">
              100% authentic certified jewelry
            </p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔒</div>
            <h3 className="feature-title">Secure Payment</h3>
            <p className="feature-description">
              Safe & encrypted transactions
            </p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔄</div>
            <h3 className="feature-title">Easy Returns</h3>
            <p className="feature-description">
              30-day hassle-free returns
            </p>
          </div>
        </div>
      </div>

      {/* Category Menu */}
      <CircleMenu />

      {/* Collections Section */}
      <div className="section-header">
        <span className="section-badge">Collections</span>
        <h2 className="section-title">Featured Collections</h2>
        <p className="section-subtitle">
          Explore our curated selection of exquisite jewelry pieces
        </p>
      </div>
      <Collections />

      {/* Trending Products Section */}
      <div className="section-header">
        <span className="section-badge">Trending</span>
        <h2 className="section-title">Trending Jewelry</h2>
        <p className="section-subtitle">
          Discover the most popular pieces loved by our customers
        </p>
      </div>
      <TrendingProducts />

      {/* Stats Section */}
      <div className="home-stats">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">10K+</div>
            <div className="stat-label">Happy Customers</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">5K+</div>
            <div className="stat-label">Products Sold</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">100+</div>
            <div className="stat-label">Unique Designs</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">4.9★</div>
            <div className="stat-label">Average Rating</div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="home-newsletter">
        <div className="newsletter-content">
          <div className="section-header">
            <span className="section-badge">Newsletter</span>
            <h2 className="section-title">Stay Updated</h2>
            <p className="section-subtitle">
              Subscribe to get special offers, free giveaways, and exclusive deals
            </p>
          </div>
          <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing!'); }}>
            <input
              type="email"
              className="newsletter-input"
              placeholder="Enter your email address"
              required
            />
            <button type="submit" className="newsletter-btn">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default Home
