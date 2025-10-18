import React from 'react'
import AnnouncementBar from '../headers/AnnouncementBar'
import MainHeader from '../headers/MainHeader'
import NavHeader from '../headers/NavHeader'
import ErrorBoundary from '../ui/ErrorBoundary'
import Footer from '../footer/Footer'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary>
    <AnnouncementBar />
    <MainHeader />
    <NavHeader />
    <main>{children}</main>
    <Footer />
  </ErrorBoundary>
)

export default Layout
