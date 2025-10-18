import React from "react";
import Head from "next/head";

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | Ecomus</title>
        <meta name="description" content="Privacy Policy of Ecomus" />
      </Head>

      <div className="info-page-container">
        <div className="info-page-hero">
          <h1>Privacy Policy</h1>
        </div>

        <div className="info-page-content">
          <p>
            We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you how we handle your personal information.
          </p>
          <h2>Information We Collect</h2>
          <p>We collect information that you provide to us, such as your name, email, and address.</p>

          <h2>How We Use Your Information</h2>
          <p>We use your information to process orders, communicate with you, and improve our services.</p>

          <h2>Security</h2>
          <p>We take appropriate measures to safeguard your information from unauthorized access.</p>

          <h2>Contact Us</h2>
          <p>If you have any questions about our privacy policy, contact us at support@ecomus.com.</p>
        </div>
      </div>
    </>
  );
}
