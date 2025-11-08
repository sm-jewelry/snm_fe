import type { AppProps } from "next/app";
import { Poppins, Playfair_Display } from "next/font/google";
import "../styles/globals.css";
import "../styles/collections.css";
import "../styles/AdminDashboard.css";
import "../styles/Categories.css";
import "../styles/catalog.css";
import "../styles/SessionWatcher.css";
import "../styles/adminCollection.css";
import "../styles/adminCollectionProduct.css";
import Layout from "../components/layout/Layout";
import Script from "next/script";
import SessionWatcher from "../components/SessionWatcher";

// Configure Poppins font for body text
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

// Configure Playfair Display font for headings
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-playfair",
  display: "swap",
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className={`${poppins.variable} ${playfairDisplay.variable}`}>
      <Layout>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        {/* 👇 Popup watcher mounted globally */}
        <SessionWatcher />
        <Component {...pageProps} />
      </Layout>
    </div>
  );
}
