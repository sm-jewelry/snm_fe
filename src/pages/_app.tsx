import type { AppProps } from "next/app";
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

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
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
  );
}
