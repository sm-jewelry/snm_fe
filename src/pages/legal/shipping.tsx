import React from "react";
import Head from "next/head";

export default function Shipping() {
  return (
    <>
      <Head>
        <title>Shipping | Ecomus</title>
      </Head>

      <div className="info-page-container">
        <div className="info-page-hero">
          <h1>Shipping</h1>
        </div>

        <div className="info-page-content">
          <p>
            We offer fast and reliable shipping worldwide. Here’s what you need to know:
          </p>

          <h2>Processing Time</h2>
          <p>Orders are processed within 1-3 business days.</p>

          <h2>Shipping Methods</h2>
          <p>We offer standard and express shipping options.</p>

          <h2>Tracking</h2>
          <p>Once shipped, you will receive a tracking number to monitor your package.</p>
        </div>
      </div>
    </>
  );
}
