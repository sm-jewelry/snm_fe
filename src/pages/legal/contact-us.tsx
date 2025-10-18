import React from "react";
import Head from "next/head";

export default function ContactUs() {
  return (
    <>
      <Head>
        <title>Contact Us | Ecomus</title>
        <meta name="description" content="Get in touch with Ecomus" />
      </Head>

      <div className="contact-us-container">
        <div className="contact-us-hero">
          <h1>Contact Us</h1>
        </div>

        <div className="contact-us-content">
          <div className="contact-us-info">
            <h2>Reach Out to Us</h2>
            <p>
              We're here to help! Whether you have questions about our products,
              need assistance with an order, or just want to say hello, feel free to
              get in touch.
            </p>
            <ul>
              <li>Email: support@ecomus.com</li>
              <li>Phone: +91 123 456 7890</li>
              <li>Address: 123 Ecomus Street, Jaipur, Rajasthan, India</li>
            </ul>
          </div>

          <div className="contact-us-form">
            <h2>Send Us a Message</h2>
            <form action="/submit-form" method="POST">
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input type="text" id="name" name="name" required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Your Email</label>
                <input type="email" id="email" name="email" required />
              </div>
              <div className="form-group">
                <label htmlFor="message">Your Message</label>
                <textarea id="message" name="message"  required></textarea>
              </div>
              <button type="submit">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
