"use client";

import React, { useState, useEffect } from 'react'
import AnnouncementBar from '../headers/AnnouncementBar'
import MainHeader from '../headers/MainHeader'
import NavHeader from '../headers/NavHeader'
import ErrorBoundary from '../ui/ErrorBoundary'
import Footer from '../footer/Footer'
import MobileBottomNav from '../mobile/MobileBottomNav'
import MobileSlideMenu from '../mobile/MobileSlideMenu'
import MobileSearchBar from '../mobile/MobileSearchBar'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <ErrorBoundary>
      {/* Announcement Bar - Hidden on Mobile via CSS */}
      <AnnouncementBar />

      {/* Main Header with Menu Button */}
      <MainHeader onMenuClick={handleMenuToggle} isMenuOpen={isMobileMenuOpen} />

      {/* Nav Header - Hidden on Mobile via CSS */}
      <NavHeader />

      {/* Mobile Search Bar - Only shows on mobile */}
      {isMobile && <MobileSearchBar />}

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <Footer />

      {/* Mobile Components */}
      {isMobile && (
        <>
          {/* Mobile Slide Menu */}
          <MobileSlideMenu
            isOpen={isMobileMenuOpen}
            onClose={handleMenuClose}
          />

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />
        </>
      )}
    </ErrorBoundary>
  );
}

export default Layout
