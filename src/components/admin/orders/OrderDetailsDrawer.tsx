import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { GridColDef } from '@mui/x-data-grid';
import { fetcher } from '../../../lib/api';
import DataTable from '../common/DataTable';
import OrderStatusStepper from './OrderStatusStepper';
import RefundDialog from './RefundDialog';

interface OrderItem {
  productId: { _id: string; title: string; URL?: string };
  quantity: number;
  price: number;
}

interface OrderDetails {
  _id: string;
  orderId: string;
  userId: { _id: string; email: string; firstName?: string; lastName?: string; phone?: string };
  items: OrderItem[];
  total?: number;
  amount?: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  transactionId?: string;
  shippingAddress?: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pinCode: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
  timeline?: Array<{ status: string; timestamp: string; note?: string }>;
  refunds?: Array<{ amount: number; reason: string; processedAt: string }>;
}

interface OrderDetailsDrawerProps {
  orderId: string | null;
  open: boolean;
  onClose: () => void;
  onOrderUpdated?: () => void;
}

const OrderDetailsDrawer: React.FC<OrderDetailsDrawerProps> = ({
  orderId,
  open,
  onClose,
  onOrderUpdated,
}) => {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (orderId && open) {
      loadOrderDetails();
    }
  }, [orderId, open]);

  const loadOrderDetails = async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const response = await fetcher(`/api/orders/admin/${orderId}`);
      const data = response.data || response;
      setOrder(data);
      setNewStatus(data.status);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to load order details',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!order || newStatus === order.status) return;
    try {
      await fetcher(`/api/orders/${order._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setSnackbar({ open: true, message: 'Order status updated successfully', severity: 'success' });
      await loadOrderDetails();
      onOrderUpdated?.();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to update status',
        severity: 'error',
      });
    }
  };

  const handleRefund = async (amount: number, reason: string) => {
    if (!order) return;
    await fetcher(`/api/orders/${order._id}/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, reason }),
    });
    setSnackbar({ open: true, message: 'Refund processed successfully', severity: 'success' });
    await loadOrderDetails();
    onOrderUpdated?.();
  };

  const itemColumns: GridColDef[] = [
    {
      field: 'image',
      headerName: 'Image',
      width: 80,
      renderCell: (params) => <Avatar src={params.value} alt={params.row.title} variant="rounded" />,
      sortable: false,
    },
    { field: 'title', headerName: 'Product', flex: 1, minWidth: 200 },
    { field: 'price', headerName: 'Price', width: 120, renderCell: (params) => `₹${params.value.toLocaleString('en-IN')}` },
    { field: 'quantity', headerName: 'Quantity', width: 100, align: 'center', headerAlign: 'center' },
    {
      field: 'total',
      headerName: 'Total',
      width: 120,
      renderCell: (params) => (
        <Typography fontWeight={600}>₹{params.value.toLocaleString('en-IN')}</Typography>
      ),
    },
  ];

  const itemRows = order?.items.map((item, index) => ({
    id: index,
    image: typeof item.productId === 'object' ? item.productId.URL : '',
    title: typeof item.productId === 'object' ? item.productId.title : 'Unknown Product',
    price: item.price,
    quantity: item.quantity,
    total: item.price * item.quantity,
  })) || [];

  const getCustomerName = () => {
    if (!order?.userId || typeof order.userId === 'string') return 'Unknown Customer';
    const { firstName, lastName, email } = order.userId;
    return firstName && lastName ? `${firstName} ${lastName}` : email;
  };

  return (
    <>
      <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 700, md: 800 } } }}>
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight={700}>
              Order Details
            </Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : order ? (
            <>
              {/* Order Summary */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ flex: '1 1 45%', minWidth: 200 }}>
                      <Typography variant="body2" color="text.secondary">Order ID</Typography>
                      <Typography variant="body1" fontWeight={600}>#{order.orderId}</Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 45%', minWidth: 200 }}>
                      <Typography variant="body2" color="text.secondary">Order Date</Typography>
                      <Typography variant="body1">{new Date(order.createdAt).toLocaleString('en-IN')}</Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 45%', minWidth: 200 }}>
                      <Typography variant="body2" color="text.secondary">Customer</Typography>
                      <Typography variant="body1">{getCustomerName()}</Typography>
                      <Typography variant="body2" color="text.secondary">{typeof order.userId === 'object' ? order.userId.email : ''}</Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 45%', minWidth: 200 }}>
                      <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                      <Typography variant="h6" color="primary.main">₹{(order.amount || order.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>Shipping Address</Typography>
                    <Typography variant="body1">{order.shippingAddress.fullName}</Typography>
                    <Typography variant="body2">{order.shippingAddress.addressLine1}</Typography>
                    {order.shippingAddress.addressLine2 && <Typography variant="body2">{order.shippingAddress.addressLine2}</Typography>}
                    <Typography variant="body2">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pinCode}</Typography>
                    <Typography variant="body2">Phone: {order.shippingAddress.phone}</Typography>
                  </CardContent>
                </Card>
              )}

              {/* Payment Details */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>Payment Information</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ flex: '1 1 45%', minWidth: 200 }}>
                      <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                      <Typography variant="body1">{order.paymentMethod || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 45%', minWidth: 200 }}>
                      <Typography variant="body2" color="text.secondary">Payment Status</Typography>
                      <Typography variant="body1" fontWeight={600} color={order.paymentStatus === 'paid' ? 'success.main' : 'warning.main'}>
                        {order.paymentStatus?.toUpperCase() || 'PENDING'}
                      </Typography>
                    </Box>
                    {order.transactionId && (
                      <Box sx={{ flex: '1 1 100%' }}>
                        <Typography variant="body2" color="text.secondary">Transaction ID</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{order.transactionId}</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Order Items</Typography>
              <Box sx={{ mb: 3 }}>
                <DataTable columns={itemColumns} rows={itemRows} pageSize={10} autoHeight hideFooter />
              </Box>

              {/* Order Timeline */}
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Order Timeline</Typography>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <OrderStatusStepper currentStatus={order.status} timeline={order.timeline} />
                </CardContent>
              </Card>

              {/* Refund History */}
              {order.refunds && order.refunds.length > 0 && (
                <>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Refund History</Typography>
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      {order.refunds.map((refund, index) => (
                        <Box key={index} sx={{ mb: index < order.refunds!.length - 1 ? 2 : 0 }}>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(refund.processedAt).toLocaleString('en-IN')}
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>₹{refund.amount.toLocaleString('en-IN')}</Typography>
                          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>{refund.reason}</Typography>
                          {index < order.refunds!.length - 1 && <Divider sx={{ mt: 2 }} />}
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Actions */}
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>Actions</Typography>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                      select
                      label="Update Status"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      fullWidth
                      size="small"
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="processing">Processing</MenuItem>
                      <MenuItem value="shipped">Shipped</MenuItem>
                      <MenuItem value="delivered">Delivered</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </TextField>
                    <Button variant="contained" onClick={handleUpdateStatus} disabled={newStatus === order.status}>
                      Update Status
                    </Button>
                  </Box>
                  <Button variant="outlined" color="error" fullWidth onClick={() => setRefundDialogOpen(true)}>
                    Process Refund
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : null}
        </Box>
      </Drawer>

      {/* Refund Dialog */}
      {order && (
        <RefundDialog
          open={refundDialogOpen}
          onClose={() => setRefundDialogOpen(false)}
          onConfirm={handleRefund}
          orderTotal={order.amount || order.total || 0}
          orderId={order.orderId}
        />
      )}

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default OrderDetailsDrawer;