import React from "react";
import Head from "next/head";

export default function FAQs() {
  return (
    <>
      <Head>
        <title>FAQs | SNM Jewelry</title>
        <meta name="description" content="Find answers to frequently asked questions about SNM Jewelry orders, shipping, returns, and jewelry care." />
      </Head>

      <div className="info-page-container">
        <div className="info-page-hero">
          <h1>Frequently Asked Questions</h1>
        </div>

        <div className="info-page-content">
          <h2>Orders & Payment</h2>

          <h3>How do I place an order?</h3>
          <p>
            Simply browse our collections, add items to your cart, and proceed to checkout.
            You'll need to create an account or log in to complete your purchase.
          </p>

          <h3>What payment methods do you accept?</h3>
          <p>We accept:</p>
          <ul>
            <li>Credit/Debit Cards (Visa, Mastercard, American Express, RuPay)</li>
            <li>Net Banking</li>
            <li>UPI (Google Pay, PhonePe, Paytm)</li>
            <li>Digital Wallets</li>
            <li>Cash on Delivery (for orders below ₹50,000)</li>
          </ul>

          <h3>Is my payment information secure?</h3>
          <p>
            Yes, absolutely. All transactions are encrypted using SSL technology and processed
            through secure payment gateways. We never store your card information.
          </p>

          <hr className="section-divider" />

          <h2>Shipping & Delivery</h2>

          <h3>How long does shipping take?</h3>
          <p>
            Domestic orders are delivered in 5-7 business days with standard shipping, or 2-3 days
            with express shipping. International orders take 7-25 business days depending on the destination.
          </p>

          <h3>How can I track my order?</h3>
          <p>
            Once your order ships, you'll receive a tracking number via email and SMS. You can track
            your order on our website or through the courier partner's portal.
          </p>

          <h3>Do you ship internationally?</h3>
          <p>
            Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location.
            International customers are responsible for any customs duties or taxes.
          </p>

          <hr className="section-divider" />

          <h2>Returns & Exchanges</h2>

          <h3>What is your return policy?</h3>
          <p>
            We offer a 30-day return policy. Items must be unworn, in original condition with tags
            and certificates. Personalized/engraved items and earrings cannot be returned.
          </p>

          <h3>How do I initiate a return?</h3>
          <p>
            Email us at <a href="mailto:returns@snmjewelry.com">returns@snmjewelry.com</a> with your
            order number. We'll provide a Return Authorization Number and instructions.
          </p>

          <h3>When will I receive my refund?</h3>
          <p>
            Refunds are processed within 2-3 business days of receiving your return. The amount will
            be credited to your original payment method within 5-10 business days.
          </p>

          <hr className="section-divider" />

          <h2>Product Information</h2>

          <h3>Are your jewelry pieces certified?</h3>
          <p>
            Yes, all our gold jewelry is BIS hallmarked, and diamond jewelry comes with
            certification from recognized gemological laboratories.
          </p>

          <h3>Do you offer customization?</h3>
          <p>
            Yes! We offer customization and personalization services. Contact us at
            <a href="mailto:custom@snmjewelry.com"> custom@snmjewelry.com</a> with your requirements.
          </p>

          <h3>How do I determine my ring size?</h3>
          <p>
            Visit our Ring Size Guide page or visit our store for professional measurement.
            You can also order a free ring sizer to be delivered to your home.
          </p>

          <h3>What metals do you use?</h3>
          <p>We work with:</p>
          <ul>
            <li>22K and 18K Gold (Yellow, White, and Rose)</li>
            <li>Platinum</li>
            <li>Sterling Silver (92.5%)</li>
          </ul>

          <hr className="section-divider" />

          <h2>Jewelry Care & Maintenance</h2>

          <h3>How do I care for my jewelry?</h3>
          <p>
            Store jewelry in separate pouches, avoid contact with chemicals and perfumes,
            clean regularly with a soft cloth, and get professional cleaning annually.
          </p>

          <h3>Do you offer cleaning services?</h3>
          <p>
            Yes, we offer complimentary cleaning and maintenance services for all SNM Jewelry
            pieces. Visit our store or contact us to schedule an appointment.
          </p>

          <h3>What is your warranty policy?</h3>
          <p>
            All our jewelry comes with a lifetime warranty against manufacturing defects.
            We'll repair or replace any piece with craftsmanship issues free of charge.
          </p>

          <hr className="section-divider" />

          <h2>Account & Security</h2>

          <h3>How do I create an account?</h3>
          <p>
            Click "Sign In" at the top of the page and select "Create Account." Fill in your
            details to register.
          </p>

          <h3>I forgot my password. What should I do?</h3>
          <p>
            Click "Forgot Password" on the login page. Enter your email address and we'll send
            you a reset link.
          </p>

          <div className="info-box">
            <h3>Still Have Questions?</h3>
            <p>
              Can't find what you're looking for? Contact our customer service team at
              <a href="mailto:support@snmjewelry.com"> support@snmjewelry.com</a> or
              call +91-XXXX-XXXXXX (Mon-Sat, 9 AM - 6 PM IST).
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
