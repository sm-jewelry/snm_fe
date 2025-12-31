import React from "react";
import Head from "next/head";

export default function ContactUs() {
  return (
    <>
      <Head>
        <title>Contact Us | SNM Jewelry</title>
        <meta name="description" content="Get in touch with SNM Jewelry. We're here to help with your questions about our jewelry, orders, and services." />
      </Head>

      <div className="info-page-container">
        <div className="info-page-hero">
          <h1>Contact Us</h1>
        </div>

        <div className="info-page-content">
          <p>
            We're here to help! Whether you have questions about our jewelry collections,
            need assistance with an order, or want personalized recommendations, our customer
            service team is ready to assist you.
          </p>

          <div className="contact-info">
            <div className="contact-card">
              <div className="contact-card-icon">📧</div>
              <h3>Email Us</h3>
              <p>
                General Inquiries:<br />
                <a href="mailto:info@snmjewelry.com">info@snmjewelry.com</a>
              </p>
              <p>
                Customer Support:<br />
                <a href="mailto:support@snmjewelry.com">support@snmjewelry.com</a>
              </p>
              <p>
                Orders & Shipping:<br />
                <a href="mailto:orders@snmjewelry.com">orders@snmjewelry.com</a>
              </p>
            </div>

            <div className="contact-card">
              <div className="contact-card-icon">📞</div>
              <h3>Call Us</h3>
              <p>
                Customer Service:<br />
                <strong>+91-XXXX-XXXXXX</strong>
              </p>
              <p>
                WhatsApp Support:<br />
                <strong>+91-XXXX-XXXXXX</strong>
              </p>
              <p>
                <small>Mon-Sat: 9:00 AM - 6:00 PM IST</small>
              </p>
            </div>

            <div className="contact-card">
              <div className="contact-card-icon">📍</div>
              <h3>Visit Our Store</h3>
              <p>
                <strong>SNM Jewelry</strong><br />
                [Your Complete Address]<br />
                City, State - PIN Code<br />
                India
              </p>
              <p>
                <small>Open Mon-Sat: 10 AM - 8 PM</small>
              </p>
            </div>
          </div>

          <hr className="section-divider" />

          <h2>Business Hours</h2>
          <table className="info-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Store Hours</th>
                <th>Customer Service</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Monday - Friday</td>
                <td>10:00 AM - 8:00 PM</td>
                <td>9:00 AM - 6:00 PM</td>
              </tr>
              <tr>
                <td>Saturday</td>
                <td>10:00 AM - 8:00 PM</td>
                <td>9:00 AM - 6:00 PM</td>
              </tr>
              <tr>
                <td>Sunday</td>
                <td>Closed</td>
                <td>Closed</td>
              </tr>
            </tbody>
          </table>

          <div className="info-box">
            <h3>💎 Quick Response Guarantee</h3>
            <p>
              We strive to respond to all inquiries within 24 hours during business days.
              For urgent matters, please call us directly or use WhatsApp for faster assistance.
            </p>
          </div>

          <h2>Frequently Contacted Departments</h2>
          <ul>
            <li><strong>Order Tracking:</strong> <a href="mailto:orders@snmjewelry.com">orders@snmjewelry.com</a></li>
            <li><strong>Returns & Exchanges:</strong> <a href="mailto:returns@snmjewelry.com">returns@snmjewelry.com</a></li>
            <li><strong>Custom Jewelry:</strong> <a href="mailto:custom@snmjewelry.com">custom@snmjewelry.com</a></li>
            <li><strong>Wholesale Inquiries:</strong> <a href="mailto:wholesale@snmjewelry.com">wholesale@snmjewelry.com</a></li>
            <li><strong>Media & Press:</strong> <a href="mailto:press@snmjewelry.com">press@snmjewelry.com</a></li>
          </ul>

          <h2>Connect With Us</h2>
          <p>Follow us on social media for the latest collections, exclusive offers, and jewelry care tips:</p>
          <ul>
            <li>Instagram: @snmjewelry</li>
            <li>Facebook: /snmjewelry</li>
            <li>Pinterest: /snmjewelry</li>
            <li>Twitter: @snmjewelry</li>
          </ul>
        </div>
      </div>
    </>
  );
}
