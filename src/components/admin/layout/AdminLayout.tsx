import React, { useState } from 'react';
import { Box, Toolbar, Container } from '@mui/material';
import AdminSidebar, { DRAWER_WIDTH } from './AdminSidebar';
import AdminAppBar from './AdminAppBar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * AdminLayout
 * Main layout wrapper for all admin pages
 * Combines sidebar, app bar, and content area
 * Responsive: drawer on mobile, permanent sidebar on desktop
 */
const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* App Bar */}
      <AdminAppBar onDrawerToggle={handleDrawerToggle} />

      {/* Sidebar */}
      <AdminSidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          marginLeft: { sm: `${DRAWER_WIDTH}px` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        {/* Spacer for app bar */}
        <Toolbar />

        {/* Page content */}
        <Container
          maxWidth={false}
          sx={{
            py: 3,
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default AdminLayout;
