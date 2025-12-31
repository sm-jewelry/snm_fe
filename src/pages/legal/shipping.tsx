import React from "react";
import Head from "next/head";

export default function Shipping() {
  return (
    <>
      <Head>
        <title>Shipping Policy | SNM Jewelry</title>
        <meta name="description" content="Learn about SNM Jewelry's shipping policies, delivery times, and tracking information." />
      </Head>

      <div className="info-page-container">
        <div className="info-page-hero">
          <h1>Shipping Policy</h1>
        </div>

        <div className="info-page-content">
          <p>
            At SNM Jewelry, we understand the excitement of receiving your beautiful jewelry pieces.
            We strive to deliver your orders safely, securely, and as quickly as possible.
          </p>

          <h2>Processing Time</h2>
          <p>
            All orders are carefully processed and prepared for shipment within <strong>1-3 business days</strong>
            (Monday through Friday, excluding public holidays). During peak seasons and special sales events,
            processing may take up to 5 business days.
          </p>

          <div className="info-box">
            <h3>💎 Premium Packaging</h3>
            <p>
              Every piece of jewelry is meticulously packaged in our signature luxury boxes with
              protective padding to ensure it arrives in perfect condition.
            </p>
          </div>

          <h2>Shipping Methods & Delivery Times</h2>

          <h3>Domestic Shipping (India)</h3>
          <table className="info-table">
            <thead>
              <tr>
                <th>Shipping Method</th>
                <th>Delivery Time</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Standard Shipping</strong></td>
                <td>5-7 business days</td>
                <td>Free on orders above ₹2,000</td>
              </tr>
              <tr>
                <td><strong>Express Shipping</strong></td>
                <td>2-3 business days</td>
                <td>₹200</td>
              </tr>
              <tr>
                <td><strong>Same Day Delivery</strong></td>
                <td>Within 24 hours</td>
                <td>₹500 (Select cities only)</td>
              </tr>
            </tbody>
          </table>

          <h3>International Shipping</h3>
          <table className="info-table">
            <thead>
              <tr>
                <th>Region</th>
                <th>Delivery Time</th>
                <th>Starting From</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Asia Pacific</strong></td>
                <td>7-12 business days</td>
                <td>₹1,500</td>
              </tr>
              <tr>
                <td><strong>Europe & UK</strong></td>
                <td>10-15 business days</td>
                <td>₹2,500</td>
              </tr>
              <tr>
                <td><strong>North America</strong></td>
                <td>12-18 business days</td>
                <td>₹3,000</td>
              </tr>
              <tr>
                <td><strong>Rest of World</strong></td>
                <td>15-25 business days</td>
                <td>₹3,500</td>
              </tr>
            </tbody>
          </table>

          <hr className="section-divider" />

          <h2>Order Tracking</h2>
          <p>
            Once your order is shipped, you will receive:
          </p>
          <ul>
            <li>An email confirmation with your tracking number</li>
            <li>SMS updates on your order status</li>
            <li>Real-time tracking through our website or courier partner's portal</li>
            <li>Estimated delivery date and time</li>
          </ul>

          <h2>Shipping Restrictions</h2>
          <p>
            Currently, we ship to most countries worldwide. However, due to customs regulations,
            we may not be able to ship to certain restricted locations. Please contact our customer
            service team if you have any questions about shipping to your area.
          </p>

          <h2>Customs & Duties (International Orders)</h2>
          <p>
            For international shipments, customs duties, taxes, and fees may apply upon delivery.
            These charges are the responsibility of the recipient and are determined by your country's
            customs authority. SNM Jewelry is not responsible for any customs delays or additional charges.
          </p>

          <div className="info-box">
            <h3>📦 Secure Delivery</h3>
            <p>
              All shipments are fully insured and require a signature upon delivery to ensure
              the safety and security of your precious jewelry.
            </p>
          </div>

          <h2>Delivery Issues</h2>
          <p>
            If your order doesn't arrive within the estimated delivery time, or if you experience
            any issues with your shipment, please contact us immediately at:
          </p>
          <ul>
            <li>Email: <a href="mailto:shipping@snmjewelry.com">shipping@snmjewelry.com</a></li>
            <li>Phone: +91-XXXX-XXXXXX</li>
            <li>WhatsApp: +91-XXXX-XXXXXX</li>
          </ul>

          <p>
            Our customer service team is available Monday through Saturday, 9:00 AM - 6:00 PM IST.
          </p>
        </div>
      </div>
    </>
  );
}
