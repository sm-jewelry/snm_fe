import React from "react";
import Head from "next/head";

export default function AboutUs() {
  return (
    <>
      <Head>
        <title>About Us | SNM Jewelry</title>
        <meta name="description" content="Discover the story behind SNM Jewelry - your trusted destination for exquisite, handcrafted jewelry since 1995." />
      </Head>

      <div className="about-us-container">
        <div className="about-us-hero">
          <h1>About SNM Jewelry</h1>
        </div>

        <div className="about-us-content">
          <div className="about-us-text">
            <h2>Our Story</h2>
            <p>
              Founded in 1995, SNM Jewelry began as a small family-owned workshop with a simple
              vision: to create timeless jewelry pieces that celebrate life's most precious moments.
              Over the past three decades, we've grown into a trusted name in fine jewelry, known
              for our exceptional craftsmanship, ethical sourcing, and personalized service.
            </p>
            <p>
              What started as a passion for creating beautiful adornments has evolved into a legacy
              of excellence. Each piece we create tells a story, captures an emotion, and becomes
              a cherished part of your journey.
            </p>

            <h2>Our Mission</h2>
            <p>
              At SNM Jewelry, our mission is to make luxury accessible while maintaining the highest
              standards of quality and authenticity. We believe that every individual deserves to own
              beautiful, responsibly-sourced jewelry that reflects their unique style and celebrates
              their special moments.
            </p>

            <h2>Our Craftsmanship</h2>
            <p>
              Every piece in our collection is meticulously crafted by skilled artisans who bring
              decades of experience and passion to their work. We combine traditional jewelry-making
              techniques with modern design sensibilities to create pieces that are both timeless
              and contemporary.
            </p>

            <h2>Our Values</h2>
            <ul>
              <li><strong>Quality & Authenticity:</strong> We use only certified precious metals and genuine gemstones</li>
              <li><strong>Ethical Sourcing:</strong> All our materials are responsibly sourced from certified suppliers</li>
              <li><strong>Customer First:</strong> Your satisfaction and trust are our top priorities</li>
              <li><strong>Craftsmanship:</strong> Every piece is handcrafted with attention to detail</li>
              <li><strong>Transparency:</strong> Clear pricing, detailed certifications, and honest communication</li>
              <li><strong>Sustainability:</strong> Committed to environmentally responsible practices</li>
            </ul>

            <h2>Why Choose SNM Jewelry?</h2>
            <ul>
              <li>30+ years of jewelry expertise and trusted service</li>
              <li>100% certified and hallmarked jewelry</li>
              <li>Lifetime warranty on all our pieces</li>
              <li>30-day hassle-free returns and exchanges</li>
              <li>Complimentary jewelry cleaning and maintenance</li>
              <li>Customization and personalization services</li>
              <li>Secure payment options and insured shipping</li>
            </ul>

            <div className="info-box">
              <h3>✨ Our Commitment</h3>
              <p>
                Every piece of jewelry from SNM comes with our promise of authenticity,
                quality craftsmanship, and exceptional service. We're not just selling jewelry;
                we're helping you create memories that last a lifetime.
              </p>
            </div>
          </div>

          <div className="about-us-image">
            <img
              src="/about-us.jpg"
              alt="SNM Jewelry Craftsmen at Work"
            />
          </div>
        </div>
      </div>
    </>
  );
}
