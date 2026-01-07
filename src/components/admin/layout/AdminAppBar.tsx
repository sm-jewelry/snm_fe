import React, { useState, useContext } from 'react';
import { useRouter } from 'next/router';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAdminTheme } from '../../../contexts/AdminThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import AdminBreadcrumbs from './AdminBreadcrumbs';
import { DRAWER_WIDTH } from './AdminSidebar';

interface AdminAppBarProps {
  onDrawerToggle: () => void;
}

/**
 * AdminAppBar
 * Top navigation bar with menu toggle, breadcrumbs, dark mode toggle, and user menu
 */
const AdminAppBar: React.FC<AdminAppBarProps> = ({ onDrawerToggle }) => {
  const router = useRouter();
  const { mode, toggleTheme } = useAdminTheme();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    router.push('/');
  };

  const handleProfile = () => {
    handleMenuClose();
    router.push('/profile');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { sm: `${DRAWER_WIDTH}px` },
        bgcolor: 'background.paper',
        color: 'text.primary',
      }}
      elevation={1}
    >
      <Toolbar>
        {/* Mobile menu toggle */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Breadcrumbs */}
        <Box sx={{ flexGrow: 1 }}>
          <AdminBreadcrumbs />
        </Box>

        {/* Dark mode toggle */}
        <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
          <IconButton onClick={toggleTheme} color="inherit" sx={{ mr: 1 }}>
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Tooltip>

        {/* User menu */}
        <Tooltip title="Account">
          <IconButton onClick={handleMenuOpen} color="inherit">
            {user?.email ? (
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.main',
                  fontSize: '0.875rem',
                }}
              >
                {user.email.charAt(0).toUpperCase()}
              </Avatar>
            ) : (
              <AccountIcon />
            )}
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          sx={{ mt: 1 }}
        >
          <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Signed in as
            </Typography>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user?.email || 'Admin'}
            </Typography>
          </Box>
          <MenuItem onClick={handleProfile}>
            <AccountIcon sx={{ mr: 1.5, fontSize: 20 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default AdminAppBar;
