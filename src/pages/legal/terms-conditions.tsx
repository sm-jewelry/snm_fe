import React from "react";
import Head from "next/head";

export default function TermsConditions() {
  return (
    <>
      <Head>
        <title>Terms & Conditions | Ecomus</title>
      </Head>

      <div className="info-page-container">
        <div className="info-page-hero">
          <h1>Terms & Conditions</h1>
        </div>

        <div className="info-page-content">
          <p>
            By using our website and services, you agree to the following terms and conditions:
          </p>

          <h2>Account</h2>
          <p>You must provide accurate information and keep your account secure.</p>

          <h2>Orders</h2>
          <p>We reserve the right to refuse or cancel orders at our discretion.</p>

          <h2>Intellectual Property</h2>
          <p>All content on this website is our property and cannot be used without permission.</p>
        </div>
      </div>
    </>
  );
}
