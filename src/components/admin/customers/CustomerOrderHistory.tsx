import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import DataTable from '../common/DataTable';
import StatusChip from '../common/StatusChip';

interface CustomerOrder {
  _id: string;
  orderId: string;
  createdAt: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  itemCount: number;
}

interface CustomerOrderHistoryProps {
  orders: CustomerOrder[];
  loading?: boolean;
  onOrderClick?: (orderId: string) => void;
}

/**
 * CustomerOrderHistory
 * Mini DataGrid showing customer's order history
 * Used in CustomerDetailsDrawer
 */
const CustomerOrderHistory: React.FC<CustomerOrderHistoryProps> = ({
  orders,
  loading = false,
  onOrderClick,
}) => {
  const columns: GridColDef[] = [
    {
      field: 'orderId',
      headerName: 'Order ID',
      width: 130,
      renderCell: (params) => (
        <Box
          sx={{
            fontWeight: 600,
            color: 'primary.main',
            cursor: onOrderClick ? 'pointer' : 'default',
            '&:hover': onOrderClick ? { textDecoration: 'underline' } : {},
          }}
          onClick={() => onOrderClick?.(params.row._id)}
        >
          #{params.value}
        </Box>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Date',
      width: 120,
      renderCell: (params) => new Date(params.value).toLocaleDateString('en-IN'),
    },
    {
      field: 'itemCount',
      headerName: 'Items',
      width: 80,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'total',
      headerName: 'Amount',
      width: 120,
      renderCell: (params) => (
        <Typography fontWeight={600}>
          ₹{params.value.toLocaleString('en-IN')}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => <StatusChip status={params.value} />,
    },
  ];

  const rows = orders.map((order) => ({
    id: order._id,
    _id: order._id,
    orderId: order.orderId,
    createdAt: order.createdAt,
    itemCount: order.itemCount,
    total: order.total,
    status: order.status,
  }));

  return (
    <Box>
      {orders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No orders found for this customer
          </Typography>
        </Box>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          pageSize={5}
          autoHeight
          hideFooter={orders.length <= 5}
        />
      )}
    </Box>
  );
};

export default CustomerOrderHistory;
