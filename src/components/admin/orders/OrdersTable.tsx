import React from 'react';
import { Box, IconButton, Chip } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { Visibility as ViewIcon } from '@mui/icons-material';
import DataTable from '../common/DataTable';
import StatusChip from '../common/StatusChip';

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

interface OrdersTableProps {
  orders: Order[];
  loading?: boolean;
  onViewDetails: (orderId: string) => void;
  pageSize?: number;
}

/**
 * OrdersTable
 * Specialized DataTable for displaying orders
 * Features: Status chips, currency formatting, date formatting, actions
 */
const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  loading = false,
  onViewDetails,
  pageSize = 20,
}) => {
  const columns: GridColDef[] = [
    {
      field: 'orderId',
      headerName: 'Order ID',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 600, color: 'primary.main' }}>
          #{params.value}
        </Box>
      ),
    },
    {
      field: 'customerName',
      headerName: 'Customer',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'customerEmail',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'createdAt',
      headerName: 'Order Date',
      width: 130,
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
      headerName: 'Total Amount',
      width: 140,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 600 }}>
          ₹{params.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Order Status',
      width: 130,
      renderCell: (params) => <StatusChip status={params.value} />,
    },
    {
      field: 'paymentStatus',
      headerName: 'Payment',
      width: 120,
      renderCell: (params) => {
        const statusColors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
          paid: 'success',
          pending: 'warning',
          failed: 'error',
          refunded: 'default',
        };
        return (
          <Chip
            label={params.value.toUpperCase()}
            size="small"
            color={statusColors[params.value] || 'default'}
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          color="primary"
          onClick={() => onViewDetails(params.row._id)}
          title="View Details"
        >
          <ViewIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const rows = orders.map((order) => ({
    id: order._id,
    _id: order._id,
    orderId: order.orderId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    createdAt: order.createdAt,
    itemCount: order.itemCount || 0,
    total: order.total,
    status: order.status,
    paymentStatus: order.paymentStatus,
  }));

  return (
    <DataTable
      columns={columns}
      rows={rows}
      loading={loading}
      pageSize={pageSize}
      autoHeight
    />
  );
};

export default OrdersTable;
