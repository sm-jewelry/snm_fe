import React from "react";
import Head from "next/head";

export default function AboutUs() {
  return (
    <>
      <Head>
        <title>About Us | Ecomus</title>
        <meta name="description" content="About Ecomus" />
      </Head>

      <div className="about-us-container">
        <div className="about-us-hero">
          <h1>About Us</h1>
        </div>

        <div className="about-us-content">
          <div className="about-us-text">
            <h2>Our Story</h2>
            <p>
              Welcome to Ecomus! We are passionate about providing high-quality
              products that inspire creativity and innovation. Our mission is to
              make shopping a delightful experience for everyone.
            </p>

            <h2>Our Mission</h2>
            <p>
              We aim to deliver exceptional products while maintaining
              transparency, sustainability, and trust with our customers.
            </p>

            <h2>Our Values</h2>
            <ul>
              <li>Quality over quantity</li>
              <li>Customer satisfaction first</li>
              <li>Innovative & creative solutions</li>
              <li>Sustainability & responsibility</li>
            </ul>
          </div>

          <div className="about-us-image">
            <img
              src="/about-us.jpg"
              alt="About Us"
            />
          </div>
        </div>
      </div>
    </>
  );
}
