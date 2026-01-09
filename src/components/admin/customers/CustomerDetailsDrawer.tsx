import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Close as CloseIcon, Email as EmailIcon, Phone as PhoneIcon } from '@mui/icons-material';
import { fetcher } from '../../../lib/api';
import CustomerOrderHistory from './CustomerOrderHistory';

interface Address {
  _id: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode?: string;
  pinCode?: string;
  phone: string;
  isDefault?: boolean;
}

interface CustomerDetails {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: string;
  isActive: boolean;
  addresses?: Address[];
  stats?: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
  };
}

interface CustomerOrder {
  _id: string;
  orderId: string;
  createdAt: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  itemCount: number;
}

interface CustomerDetailsDrawerProps {
  customerId: string | null;
  open: boolean;
  onClose: () => void;
  onCustomerUpdated?: () => void;
}

const CustomerDetailsDrawer: React.FC<CustomerDetailsDrawerProps> = ({
  customerId,
  open,
  onClose,
  onCustomerUpdated,
}) => {
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (customerId && open) {
      loadCustomerDetails();
      loadCustomerOrders();
    }
  }, [customerId, open]);

  const loadCustomerDetails = async () => {
    if (!customerId) return;
    try {
      setLoading(true);
      const response = await fetcher(`/api/customers/${customerId}`);
      
      // Handle nested response structure
      let customerData = null;
      
      if (response.success && response.data) {
        // If API returns {success: true, data: {user: {...}}}
        customerData = response.data.user || response.data;
      } else if (response.data) {
        // If API returns {data: {...}}
        customerData = response.data;
      } else {
        // If API returns customer object directly
        customerData = response;
      }
      
      setCustomer(customerData);
    } catch (error) {
      console.error('Failed to load customer details:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to load customer details',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerOrders = async () => {
    if (!customerId) return;
    try {
      const response = await fetcher(`/api/orders/admin/all?customerId=${customerId}`);
      const data = response.data || response;
      const ordersList = data.orders || data || [];
      const transformedOrders = ordersList.map((order: any) => ({
        _id: order._id,
        orderId: order.orderId || order._id.slice(-8).toUpperCase(),
        createdAt: order.createdAt,
        total: order.amount || order.total || 0,
        status: order.status || 'pending',
        itemCount: order.items?.length || 0,
      }));
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Failed to load customer orders:', error);
      setOrders([]);
    }
  };

  const handleToggleStatus = async () => {
    if (!customer) return;
    try {
      await fetcher(`/api/customers/${customer._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !customer.isActive }),
      });
      setSnackbar({
        open: true,
        message: `Customer account ${customer.isActive ? 'disabled' : 'enabled'} successfully`,
        severity: 'success',
      });
      await loadCustomerDetails();
      onCustomerUpdated?.();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to update customer status',
        severity: 'error',
      });
    }
  };

  const getCustomerName = () => {
    if (!customer) return '';
    return customer.firstName && customer.lastName
      ? `${customer.firstName} ${customer.lastName}`
      : customer.email;
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{ sx: { width: { xs: '100%', sm: 600, md: 700 } } }}
      >
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight={700}>
              Customer Details
            </Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : customer ? (
            <>
              {/* Customer Profile */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {getCustomerName()}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body2">{customer.email}</Typography>
                      </Box>
                      {customer.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2">{customer.phone}</Typography>
                        </Box>
                      )}
                    </Box>
                    <Chip
                      label={customer.isActive ? 'Active' : 'Inactive'}
                      color={customer.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Customer since: {new Date(customer.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={customer.isActive}
                        onChange={handleToggleStatus}
                        color="success"
                      />
                    }
                    label={customer.isActive ? 'Account Active' : 'Account Inactive'}
                    sx={{ mt: 2 }}
                  />
                </CardContent>
              </Card>

              {/* Customer Stats */}
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Customer Statistics
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary.main" fontWeight={700}>
                        {customer.stats?.totalOrders || orders.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Orders
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" color="success.main" fontWeight={700}>
                        ₹{(customer.stats?.totalSpent || orders.reduce((sum, o) => sum + o.total, 0)).toLocaleString('en-IN')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Spent
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" color="info.main" fontWeight={700}>
                        ₹{(customer.stats?.averageOrderValue || (orders.length > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0)).toLocaleString('en-IN')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg Order
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>

              {/* Order History */}
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Order History
              </Typography>
              <Box sx={{ mb: 3 }}>
                <CustomerOrderHistory orders={orders} />
              </Box>

              {/* Saved Addresses */}
              {customer.addresses && customer.addresses.length > 0 && (
                <>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Saved Addresses
                  </Typography>
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <List disablePadding>
                        {customer.addresses.map((address, index) => (
                          <React.Fragment key={address._id}>
                            {index > 0 && <Divider sx={{ my: 2 }} />}
                            <ListItem disablePadding>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body1" fontWeight={600}>
                                      {address.fullName}
                                    </Typography>
                                    {address.isDefault && (
                                      <Chip label="Default" size="small" color="primary" />
                                    )}
                                  </Box>
                                }
                                secondary={
                                  <>
                                    <Typography variant="body2" component="div">
                                      {address.addressLine1}
                                    </Typography>
                                    {address.addressLine2 && (
                                      <Typography variant="body2" component="div">
                                        {address.addressLine2}
                                      </Typography>
                                    )}
                                    <Typography variant="body2" component="div">
                                      {address.city}, {address.state} - {address.zipCode || address.pinCode}
                                    </Typography>
                                    <Typography variant="body2" component="div">
                                      Phone: {address.phone}
                                    </Typography>
                                  </>
                                }
                              />
                            </ListItem>
                          </React.Fragment>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <Typography color="text.secondary">No customer data available</Typography>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CustomerDetailsDrawer;