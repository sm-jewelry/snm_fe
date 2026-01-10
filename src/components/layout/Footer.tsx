import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';

const Footer: React.FC = () => {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      {/* Main Footer */}
      <div className="footer-main">
        <div className="footer-container">
          {/* About Section */}
          <div className="footer-column">
            <h3 className="footer-heading">SNM Jewelry</h3>
            <p className="footer-description">
              Crafting timeless elegance since 2020. We specialize in premium,
              handcrafted jewelry that celebrates life's precious moments.
            </p>
            <div className="footer-social">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <span>📘</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <span>📷</span>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <span>🐦</span>
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <span>📌</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-column">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li><Link href="/shop">Shop All</Link></li>
              <li><Link href="/products/new-arrivals">New Arrivals</Link></li>
              <li><Link href="/best">Best Sellers</Link></li>
              <li><Link href="/brands">Brands</Link></li>
              <li><Link href="/profile/my-reviews">My Reviews</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="footer-column">
            <h3 className="footer-heading">Customer Service</h3>
            <ul className="footer-links">
              <li><Link href="/legal/contact-us">Contact Us</Link></li>
              <li><Link href="/legal/faqs">FAQs</Link></li>
              <li><Link href="/profile">My Account</Link></li>
              <li><Link href="/cart">Shopping Cart</Link></li>
              <li><Link href="/checkout">Checkout</Link></li>
            </ul>
          </div>

          {/* Information */}
          <div className="footer-column">
            <h3 className="footer-heading">Information</h3>
            <ul className="footer-links">
              <li><Link href="/legal/about-us">About Us</Link></li>
              <li><Link href="/legal/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/legal/terms-conditions">Terms & Conditions</Link></li>
              <li><Link href="/legal/shipping">Shipping Policy</Link></li>
              <li><Link href="/legal/returns-exchanges">Return Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-column footer-newsletter">
            <h3 className="footer-heading">Stay Connected</h3>
            <p className="footer-description">
              Subscribe to get special offers and updates
            </p>
            <form className="newsletter-form-footer" onSubmit={(e) => {
              e.preventDefault(); Swal.fire({
                icon: "success",
                title: "Subscribed!",
                timer: 1500,
                showConfirmButton: false,
              });
            }}>
              <input
                type="email"
                placeholder="Your email address"
                className="newsletter-input-footer"
                required
              />
              <button type="submit" className="newsletter-btn-footer">
                Subscribe
              </button>
            </form>
            <div className="footer-contact">
              <p>📞 +91 123 456 7890</p>
              <p>✉️ support@snmjewelry.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment & Trust */}
      <div className="footer-trust">
        <div className="footer-container">
          <div className="trust-badges">
            <div className="trust-item">
              <span className="trust-icon">🔒</span>
              <span className="trust-text">Secure Payment</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">✓</span>
              <span className="trust-text">Certified Jewelry</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🚚</span>
              <span className="trust-text">Fast Delivery</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">↩️</span>
              <span className="trust-text">Easy Returns</span>
            </div>
          </div>
          <div className="payment-methods">
            <span className="payment-label">We Accept:</span>
            <div className="payment-icons">
              <span className="payment-icon">💳</span>
              <span className="payment-icon">💰</span>
              <span className="payment-icon">📱</span>
              <span className="payment-icon">🏦</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-container">
          <p className="footer-copyright">
            © {currentYear} SNM Jewelry. All rights reserved.
          </p>
          <p className="footer-credit">
            Crafted with 💛 by SNM Team
          </p>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        className="back-to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        ↑
      </button>
    </footer>
  );
};

export default Footer;
