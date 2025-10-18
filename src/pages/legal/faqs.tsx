import React from "react";
import Head from "next/head";

export default function FAQs() {
  return (
    <>
      <Head>
        <title>FAQs | Ecomus</title>
      </Head>

      <div className="info-page-container">
        <div className="info-page-hero">
          <h1>Frequently Asked Questions</h1>
        </div>

        <div className="info-page-content">
          <h2>1. How can I track my order?</h2>
          <p>After your order is shipped, you will receive a tracking number via email.</p>

          <h2>2. What is your return policy?</h2>
          <p>We accept returns within 30 days of receipt in original condition.</p>

          <h2>3. Do you ship internationally?</h2>
          <p>Yes, we ship worldwide with standard and express options.</p>

          <h2>4. How can I contact customer support?</h2>
          <p>You can email us at support@ecomus.com or use the contact form.</p>
        </div>
      </div>
    </>
  );
}
