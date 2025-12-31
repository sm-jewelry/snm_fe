import React from "react";
import Head from "next/head";

export default function ReturnsExchanges() {
  return (
    <>
      <Head>
        <title>Returns & Exchanges | SNM Jewelry</title>
        <meta name="description" content="SNM Jewelry's hassle-free return and exchange policy. Learn about our 30-day return guarantee." />
      </Head>

      <div className="info-page-container">
        <div className="info-page-hero">
          <h1>Returns & Exchanges</h1>
        </div>

        <div className="info-page-content">
          <p>
            At SNM Jewelry, your satisfaction is our priority. We offer a hassle-free
            <strong> 30-day return and exchange policy</strong> to ensure you're completely
            delighted with your purchase.
          </p>

          <div className="info-box">
            <h3>💎 Our Promise</h3>
            <p>
              If you're not completely satisfied with your jewelry, you can return or exchange
              it within 30 days of delivery, no questions asked.
            </p>
          </div>

          <h2>Return Eligibility</h2>
          <p>To be eligible for a return or exchange, items must meet the following conditions:</p>
          <ul>
            <li>Returned within <strong>30 days</strong> of delivery date</li>
            <li>In original, unworn condition with all tags attached</li>
            <li>Accompanied by the original receipt or proof of purchase</li>
            <li>In the original packaging with all certificates and documentation</li>
            <li>Not personalized, engraved, or custom-made (unless defective)</li>
          </ul>

          <h2>Non-Returnable Items</h2>
          <p>The following items cannot be returned or exchanged:</p>
          <ul>
            <li>Personalized or engraved jewelry</li>
            <li>Custom-made pieces designed specifically for you</li>
            <li>Earrings (for hygiene reasons)</li>
            <li>Items purchased during final sale or clearance events</li>
            <li>Gift cards and vouchers</li>
          </ul>

          <hr className="section-divider" />

          <h2>How to Initiate a Return or Exchange</h2>

          <h3>Step 1: Contact Us</h3>
          <p>
            Email us at <a href="mailto:returns@snmjewelry.com">returns@snmjewelry.com</a> or
            call +91-XXXX-XXXXXX with your order number and reason for return. Our customer
            service team will provide you with a Return Authorization Number (RAN).
          </p>

          <h3>Step 2: Package Your Item</h3>
          <p>
            Carefully package the item in its original box with all tags, certificates,
            and documentation. Include your RAN in the package.
          </p>

          <h3>Step 3: Ship the Item</h3>
          <p>
            You can either use our prepaid return label (₹100 will be deducted from your refund)
            or ship it using your preferred courier service.
          </p>

          <div className="info-box">
            <h3>📦 Return Shipping Address</h3>
            <p>
              SNM Jewelry - Returns Department<br />
              [Your Complete Address]<br />
              City, State - PIN Code<br />
              India
            </p>
          </div>

          <h3>Step 4: Inspection & Processing</h3>
          <p>
            Once we receive your return, our team will inspect the item within 2-3 business days.
            You'll receive an email confirmation once your return is approved.
          </p>

          <h2>Refund Policy</h2>
          <p>
            After your return is approved, refunds are processed as follows:
          </p>
          <table className="info-table">
            <thead>
              <tr>
                <th>Payment Method</th>
                <th>Refund Timeline</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Credit/Debit Card</td>
                <td>5-7 business days</td>
              </tr>
              <tr>
                <td>Net Banking</td>
                <td>5-7 business days</td>
              </tr>
              <tr>
                <td>UPI/Wallet</td>
                <td>3-5 business days</td>
              </tr>
              <tr>
                <td>Cash on Delivery</td>
                <td>7-10 business days (Bank Transfer)</td>
              </tr>
            </tbody>
          </table>

          <p>
            <strong>Note:</strong> The refunded amount will be the actual amount paid, excluding
            any shipping charges. Original shipping charges are non-refundable unless the item
            was defective or we made an error.
          </p>

          <h2>Exchange Policy</h2>
          <p>
            If you'd like to exchange your jewelry for a different size, style, or design:
          </p>
          <ul>
            <li>Follow the same return process mentioned above</li>
            <li>Indicate in your email that you'd like an exchange</li>
            <li>Once we receive and approve your return, we'll ship the new item</li>
            <li>If the new item costs more, you'll pay the difference</li>
            <li>If it costs less, we'll refund the difference</li>
            <li>Exchanges are shipped free of charge</li>
          </ul>

          <h2>Defective or Damaged Items</h2>
          <p>
            If you receive a defective or damaged item, please contact us within
            <strong> 7 days</strong> of delivery:
          </p>
          <ul>
            <li>Email photos of the defect/damage to <a href="mailto:support@snmjewelry.com">support@snmjewelry.com</a></li>
            <li>Include your order number and description of the issue</li>
            <li>We'll arrange a free pickup and send you a replacement immediately</li>
            <li>Full refund will be issued if a replacement is not available</li>
          </ul>

          <div className="info-box">
            <h3>✨ Lifetime Warranty</h3>
            <p>
              All SNM Jewelry pieces come with a lifetime warranty against manufacturing defects.
              If you experience any issues with craftsmanship, we'll repair or replace your
              jewelry free of charge.
            </p>
          </div>

          <h2>Need Help?</h2>
          <p>
            Our customer service team is here to assist you with any questions about
            returns or exchanges:
          </p>
          <ul>
            <li>Email: <a href="mailto:returns@snmjewelry.com">returns@snmjewelry.com</a></li>
            <li>Phone: +91-XXXX-XXXXXX</li>
            <li>Live Chat: Available on our website Mon-Sat, 9 AM - 6 PM IST</li>
          </ul>
        </div>
      </div>
    </>
  );
}
