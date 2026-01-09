import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  MenuItem,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';
import { FileDownload as ExportIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { fetcher } from '../../../lib/api';
import CustomersTable from '../../../components/admin/customers/CustomersTable';
import CustomerDetailsDrawer from '../../../components/admin/customers/CustomerDetailsDrawer';
import ConfirmDialog from '../../../components/admin/common/ConfirmDialog';
import LoadingState from '../../../components/admin/common/LoadingState';
import { exportCustomersToCSV } from '../../../utils/csvExport';

interface Customer {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: string;
  isActive: boolean;
  totalOrders?: number;
  lifetimeValue?: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toggleDialog, setToggleDialog] = useState<{
    open: boolean;
    customerId: string | null;
    currentStatus: boolean;
  }>({
    open: false,
    customerId: null,
    currentStatus: true,
  });
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
    loadCustomers();
  }, [statusFilter]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetcher(`/api/customers?${params.toString()}`);

      // Extract customers from ApiResponse structure
      const data = response.data || response;
      const customersList = Array.isArray(data) ? data : (data.customers || data.users || []);

      // Calculate lifetime value and order count from orders if not provided
      const customersWithStats = await Promise.all(
        customersList.map(async (customer: any) => {
          try {
            const ordersResponse = await fetcher(`/api/orders/admin/all?customerId=${customer._id}`);
            const ordersData = ordersResponse.data || ordersResponse;
            const orders = ordersData.orders || ordersData || [];
            const totalOrders = orders.length;
            const lifetimeValue = orders.reduce((sum: number, order: any) => sum + (order.amount || order.total || 0), 0);

            return {
              _id: customer._id,
              email: customer.email,
              firstName: customer.firstName,
              lastName: customer.lastName,
              phone: customer.phone,
              createdAt: customer.createdAt,
              isActive: customer.isActive !== undefined ? customer.isActive : true,
              totalOrders: customer.totalOrders || totalOrders,
              lifetimeValue: customer.lifetimeValue || lifetimeValue,
            };
          } catch (error) {
            // If orders fetch fails, return customer without stats
            return {
              _id: customer._id,
              email: customer.email,
              firstName: customer.firstName,
              lastName: customer.lastName,
              phone: customer.phone,
              createdAt: customer.createdAt,
              isActive: customer.isActive !== undefined ? customer.isActive : true,
              totalOrders: customer.totalOrders || 0,
              lifetimeValue: customer.lifetimeValue || 0,
            };
          }
        })
      );

      setCustomers(customersWithStats);
    } catch (error) {
      console.error('Failed to load customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedCustomerId(null);
  };

  const handleToggleStatusClick = (customerId: string, currentStatus: boolean) => {
    setToggleDialog({
      open: true,
      customerId,
      currentStatus,
    });
  };

  const handleToggleStatusConfirm = async () => {
    if (!toggleDialog.customerId) return;
    try {
      await fetcher(`/api/customers/${toggleDialog.customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !toggleDialog.currentStatus }),
      });
      setSnackbar({
        open: true,
        message: `Customer account ${toggleDialog.currentStatus ? 'disabled' : 'enabled'} successfully`,
        severity: 'success',
      });
      setToggleDialog({ open: false, customerId: null, currentStatus: true });
      await loadCustomers();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to update customer status',
        severity: 'error',
      });
    }
  };

  const handleSearch = () => {
    loadCustomers();
  };

  const handleExport = () => {
    exportCustomersToCSV(customers);
  };

  if (loading && customers.length === 0) {
    return <LoadingState message="Loading customers..." />;
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Customer Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadCustomers}>
            Refresh
          </Button>
          <Button variant="outlined" startIcon={<ExportIcon />} onClick={handleExport}>
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: '1 1 200px', minWidth: 200, maxWidth: { xs: '100%', sm: 250 } }}>
            <TextField
              select
              label="Account Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="all">All Customers</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Box>

          <Box sx={{ flex: '1 1 400px', minWidth: 250 }}>
            <TextField
              label="Search"
              placeholder="Name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              fullWidth
              size="small"
            />
          </Box>

          <Box sx={{ flex: '0 0 auto', minWidth: { xs: '100%', md: 'auto' } }}>
            <Button variant="contained" onClick={handleSearch} fullWidth sx={{ height: '40px', minWidth: 120 }}>
              Search
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Stats Summary */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 200, '@media (min-width: 600px)': { flex: '1 1 calc(25% - 12px)' } }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary.main" fontWeight={700}>
              {customers.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Customers
            </Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 200, '@media (min-width: 600px)': { flex: '1 1 calc(25% - 12px)' } }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" fontWeight={700}>
              {customers.filter((c) => c.isActive).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active
            </Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 200, '@media (min-width: 600px)': { flex: '1 1 calc(25% - 12px)' } }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main" fontWeight={700}>
              {customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Orders
            </Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 200, '@media (min-width: 600px)': { flex: '1 1 calc(25% - 12px)' } }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h5" color="secondary.main" fontWeight={700}>
              ₹{customers.reduce((sum, c) => sum + (c.lifetimeValue || 0), 0).toLocaleString('en-IN')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Revenue
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Customers Table */}
      <CustomersTable
        customers={customers}
        loading={loading}
        onViewDetails={handleViewDetails}
        onToggleStatus={handleToggleStatusClick}
        pageSize={20}
      />

      {/* Customer Details Drawer */}
      <CustomerDetailsDrawer
        customerId={selectedCustomerId}
        open={drawerOpen}
        onClose={handleCloseDrawer}
        onCustomerUpdated={loadCustomers}
      />

      {/* Toggle Status Confirmation */}
      <ConfirmDialog
        open={toggleDialog.open}
        onClose={() => setToggleDialog({ open: false, customerId: null, currentStatus: true })}
        onConfirm={handleToggleStatusConfirm}
        title={toggleDialog.currentStatus ? 'Disable Customer Account' : 'Enable Customer Account'}
        message={
          toggleDialog.currentStatus
            ? 'Are you sure you want to disable this customer account? They will not be able to place orders.'
            : 'Are you sure you want to enable this customer account?'
        }
        confirmText={toggleDialog.currentStatus ? 'Disable' : 'Enable'}
        confirmColor={toggleDialog.currentStatus ? 'error' : 'success'}
      />

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}