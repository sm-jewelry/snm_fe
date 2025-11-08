import React from 'react'
import AnnouncementBar from '../headers/AnnouncementBar'
import MainHeader from '../headers/MainHeader'
import NavHeader from '../headers/NavHeader'
import ErrorBoundary from '../ui/ErrorBoundary'
import Footer from '../footer/Footer'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary>
    <div className="layout-wrapper">
      <div className="layout-content">
        <AnnouncementBar />
        <MainHeader />
        <NavHeader />
        <main className="main-content">{children}</main>
      </div>
      <Footer />
    </div>
  </ErrorBoundary>
)

export default Layout
