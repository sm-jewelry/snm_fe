import type { AppProps } from "next/app";
import "../styles/globals.css";
import "../styles/collections.css";
import Layout from "../components/layout/Layout";
import Script from "next/script";

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
        <Component {...pageProps} />
      </Layout>
  );
}
