import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import "../styles/globals.css";
import "../styles/collections.css";
import "../styles/AdminDashboard.css";
import "../styles/Categories.css";
import "../styles/catalog.css";
import "../styles/SessionWatcher.css";
import "../styles/adminCollection.css";
import "../styles/adminCollectionProduct.css";
import "../styles/login.css";
import "../styles/register.css";
import "../styles/forgot-password.css";
import "../styles/email-verification.css";
import "../styles/profile.css";
import "../styles/checkout.css";
import "../styles/ProductCard.css";
import "../styles/TrendingProducts.css";
import "../styles/BestSellers.css";
import "../styles/TopRated.css";
import "../styles/Brands.css";
import "../styles/ProductDetail.css";
import "../styles/CategoryProducts.css";
import "../styles/CategoryNav.css";
import "../styles/Reviews.css";
import "../styles/MyReviews.css";
import "../styles/AdminReviews.css";
import "../styles/Shop.css";
import "../styles/Home.css";
import "../styles/Footer.css";
import "../styles/LegalPages.css";
import "../styles/OrderSuccess.css";
import "../styles/OrderFailure.css";
import Layout from "../components/layout/Layout";
import AdminLayout from "../components/admin/layout/AdminLayout";
import { AdminThemeProvider } from "../contexts/AdminThemeContext";
import Script from "next/script";
import { AuthProvider } from "../contexts/AuthContext";
import { ErrorBoundary } from "../components/common/ErrorBoundary";
import { ErrorNotificationProvider } from "../components/common/ErrorNotification";
import InstallPWA from "../components/common/InstallPWA";
import '../styles/InstallPWA.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdminRoute = router.pathname.startsWith('/admin');

  return (
    <>
      <Head>
        <link rel="icon" href="/snm.ico" />
        
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#D4AF37" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SNM Jewelry" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192x192.png" />
        
        {/* Viewport for mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
      </Head>
      <ErrorBoundary>
        <ErrorNotificationProvider>
          <AuthProvider>
             {/* Add Install PWA Banner */}
            {!isAdminRoute && <InstallPWA />}
            {isAdminRoute ? (
              <AdminThemeProvider>
                <AdminLayout>
                  <Component {...pageProps} />
                </AdminLayout>
              </AdminThemeProvider>
            ) : (
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
            )}
          </AuthProvider>
        </ErrorNotificationProvider>
      </ErrorBoundary>
    </>
  );
}