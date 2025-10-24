"use client";
import React from "react";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        {/* ----- Column 1 ----- */}
        <div className="footer-col">
          <h2 className="footer-logo">ecomus</h2>
          <p>Address: 1234 Fashion Street, Suite 567,<br />New York, NY</p>
          <p>Email: <a href="mailto:info@fashionshop.com">info@fashionshop.com</a></p>
          <p>Phone: <a href="tel:(212)555-1234">(212)555-1234</a></p>
          <a href="#" className="footer-link direction">Get direction →</a>
          <div className="footer-socials">
            <a href="#"><i className="fab fa-facebook-f"></i></a>
            {/* <a href="#"><i className="fab fa-x-twitter"></i></a> */}
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-tiktok"></i></a>
            <a href="#"><i className="fab fa-pinterest-p"></i></a>
          </div>
        </div>

        {/* ----- Column 2 ----- */}
        <div className="footer-col">
          <h4>Help</h4>
          <ul>
            <li><a href="/legal/privacy-policy">Privacy Policy</a></li>
            <li><a href="/legal/returns-exchanges">Returns + Exchanges</a></li>
            <li><a href="/legal/shipping">Shipping</a></li>
            <li><a href="/legal/terms-conditions">Terms & Conditions</a></li>
            <li><a href="/legal/faqs">FAQ’s</a></li>
            {/* <li><a href="#">Compare</a></li> */}
            <li><a href="/wishlist">My Wishlist</a></li>
          </ul>
        </div>

        {/* ----- Column 3 ----- */}
        <div className="footer-col">
          <h4>About us</h4>
          <ul>
            {/* <li><a href="#">Our Story</a></li>
            <li><a href="#">Visit Our Store</a></li> */}
            <li><a href="/legal/contact-us">Contact Us</a></li>
            <li><a href="/legal/about-us">About Us</a></li>
            <li><a href="/profile">Account</a></li>
          </ul>
        </div>

        {/* ----- Column 4 ----- */}
        <div className="footer-col">
          <h4>Sign Up for Email</h4>
          <p>
            Sign up to get first dibs on new arrivals, sales,
            exclusive content, events and more!
          </p>
          <div className="subscribe-box">
            <input type="email" placeholder="Your email" />
            <button>Subscribe →</button>
          </div>
          {/* <div className="footer-lang">
            <span>🇺🇸 USD</span>
            <span>English</span>
          </div> */}
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 Ecomus. All rights reserved.</p>
        <div className="payment-icons">
          <img src="/Visa.png" alt="Visa" />
          <img src="/PayPal.svg" alt="PayPal" />
          <img src="/mastercard.png" alt="Mastercard" />
          <img src="/discover.png" alt="Discover" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
