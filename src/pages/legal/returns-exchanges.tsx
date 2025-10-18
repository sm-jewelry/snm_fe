import React from "react";
import Head from "next/head";

export default function ReturnsExchanges() {
  return (
    <>
      <Head>
        <title>Returns & Exchanges | Ecomus</title>
      </Head>

      <div className="info-page-container">
        <div className="info-page-hero">
          <h1>Returns & Exchanges</h1>
        </div>

        <div className="info-page-content">
          <p>
            We want you to be completely satisfied with your purchase. If you are not satisfied, 
            you can return or exchange items under the following conditions:
          </p>

          <h2>Return Policy</h2>
          <p>Items must be returned within 30 days of receipt and in their original condition.</p>

          <h2>Exchange Policy</h2>
          <p>Exchanges are allowed for items of equal value. Contact support@ecomus.com to initiate.</p>

          <h2>Non-returnable Items</h2>
          <p>Gift cards, downloadable products, and final sale items cannot be returned or exchanged.</p>
        </div>
      </div>
    </>
  );
}
