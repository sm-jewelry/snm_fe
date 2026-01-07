import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  MenuItem,
  Paper,
} from '@mui/material';
import {
  FileDownload as ExportIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

import { fetcher } from '../../../lib/api';
import OrdersTable from '../../../components/admin/orders/OrdersTable';
import OrderDetailsDrawer from '../../../components/admin/orders/OrderDetailsDrawer';
import LoadingState from '../../../components/admin/common/LoadingState';

interface Order {
  _id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  itemCount?: number;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [statusFilter, paymentFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (paymentFilter !== 'all') params.append('paymentStatus', paymentFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetcher(
        `/api/orders/admin/all?${params.toString()}`
      );

      const data = response.data || response;
      const ordersList = data.orders || data || [];

      const transformedOrders: Order[] = ordersList.map((order: any) => ({
        _id: order._id,
        orderId: order.orderId || order._id.slice(-8).toUpperCase(),
        customerName: order.userId
          ? typeof order.userId === 'object'
            ? order.userId.firstName && order.userId.lastName
              ? `${order.userId.firstName} ${order.userId.lastName}`
              : order.userId.email
            : 'Unknown'
          : 'Guest',
        customerEmail:
          order.userId && typeof order.userId === 'object'
            ? order.userId.email
            : 'N/A',
        createdAt: order.createdAt,
        total: order.amount || order.total || 0,
        status: order.status || 'pending',
        paymentStatus: order.paymentStatus || 'pending',
        itemCount: order.items?.length || 0,
      }));

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedOrderId(null);
  };

  const handleSearch = () => {
    loadOrders();
  };

  const handleExport = () => {
    alert('CSV export will be implemented');
  };

  if (loading && orders.length === 0) {
    return <LoadingState message="Loading orders..." />;
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          Order Management
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadOrders}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExport}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: '1fr 1fr 2fr 1fr',
            },
            gap: 2,
          }}
        >
          <TextField
            select
            label="Order Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            fullWidth
            size="small"
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="shipped">Shipped</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>

          <TextField
            select
            label="Payment Status"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            fullWidth
            size="small"
          >
            <MenuItem value="all">All Payment Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
            <MenuItem value="refunded">Refunded</MenuItem>
          </TextField>

          <TextField
            label="Search"
            placeholder="Order ID, customer name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            fullWidth
            size="small"
          />

          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{ height: 40 }}
          >
            Search
          </Button>
        </Box>
      </Paper>

      {/* Stats */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr 1fr',
            sm: 'repeat(4, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={700}>
            {orders.length}
          </Typography>
          <Typography variant="body2">Total Orders</Typography>
        </Paper>

        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4" color="warning.main" fontWeight={700}>
            {orders.filter(o => o.status === 'pending').length}
          </Typography>
          <Typography variant="body2">Pending</Typography>
        </Paper>

        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4" color="info.main" fontWeight={700}>
            {orders.filter(
              o => o.status === 'processing' || o.status === 'shipped'
            ).length}
          </Typography>
          <Typography variant="body2">In Progress</Typography>
        </Paper>

        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4" color="success.main" fontWeight={700}>
            {orders.filter(o => o.status === 'delivered').length}
          </Typography>
          <Typography variant="body2">Delivered</Typography>
        </Paper>
      </Box>

      {/* Orders Table */}
      <OrdersTable
        orders={orders}
        loading={loading}
        pageSize={20}
        onViewDetails={handleViewDetails}
      />

      {/* Drawer */}
      <OrderDetailsDrawer
        orderId={selectedOrderId}
        open={drawerOpen}
        onClose={handleCloseDrawer}
        onOrderUpdated={loadOrders}
      />
    </Box>
  );
}
