import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Divider,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  Collections as CollectionsIcon,
  ShoppingBag as ProductsIcon,
  RateReview as ReviewsIcon,
  ShoppingCart as OrdersIcon,
  People as CustomersIcon,
} from '@mui/icons-material';

const DRAWER_WIDTH = 260;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: <DashboardIcon /> },
  { label: 'Categories', path: '/admin/categories', icon: <CategoryIcon /> },
  { label: 'Catalogs', path: '/admin/catalogs', icon: <InventoryIcon /> },
  { label: 'Collections', path: '/admin/collections', icon: <CollectionsIcon /> },
  { label: 'Products', path: '/admin/products', icon: <ProductsIcon /> },
  { label: 'Reviews', path: '/admin/reviews', icon: <ReviewsIcon /> },
  { label: 'Orders', path: '/admin/orders', icon: <OrdersIcon /> },
  { label: 'Customers', path: '/admin/customers', icon: <CustomersIcon /> },
];

interface AdminSidebarProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
}

/**
 * AdminSidebar
 * Responsive sidebar navigation for admin panel
 * Shows on desktop, drawer on mobile
 */
const AdminSidebar: React.FC<AdminSidebarProps> = ({ mobileOpen, onDrawerToggle }) => {
  const router = useRouter();

  const isActive = (path: string): boolean => {
    if (path === '/admin') {
      return router.pathname === '/admin';
    }
    return router.pathname.startsWith(path);
  };

  const drawerContent = (
    <Box>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main' }}>
            SNM
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 400 }}>
            Admin
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1, py: 2 }}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <Link href={item.path} passHref legacyBehavior>
                <ListItemButton
                  component="a"
                  selected={active}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                    '&:hover': {
                      backgroundColor: active ? 'primary.dark' : 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: active ? 'white' : 'text.secondary',
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.95rem',
                      fontWeight: active ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              </Link>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default AdminSidebar;
export { DRAWER_WIDTH };
