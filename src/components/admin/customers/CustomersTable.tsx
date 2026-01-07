import React from 'react';
import { Box, IconButton, Chip } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { Visibility as ViewIcon, Block as BlockIcon, CheckCircle as ActiveIcon } from '@mui/icons-material';
import DataTable from '../common/DataTable';

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

interface CustomersTableProps {
  customers: Customer[];
  loading?: boolean;
  onViewDetails: (customerId: string) => void;
  onToggleStatus?: (customerId: string, currentStatus: boolean) => void;
  pageSize?: number;
}

/**
 * CustomersTable
 * Specialized DataTable for displaying customers
 * Features: Status chips, lifetime value, order count, quick actions
 */
const CustomersTable: React.FC<CustomersTableProps> = ({
  customers,
  loading = false,
  onViewDetails,
  onToggleStatus,
  pageSize = 20,
}) => {
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 600 }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 140,
    },
    {
      field: 'createdAt',
      headerName: 'Registered',
      width: 130,
      renderCell: (params) => new Date(params.value).toLocaleDateString('en-IN'),
    },
    {
      field: 'totalOrders',
      headerName: 'Orders',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value || 0}
          size="small"
          color={params.value > 0 ? 'primary' : 'default'}
        />
      ),
    },
    {
      field: 'lifetimeValue',
      headerName: 'Lifetime Value',
      width: 140,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 600 }}>
          ₹{(params.value || 0).toLocaleString('en-IN')}
        </Box>
      ),
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          size="small"
          color={params.value ? 'success' : 'default'}
          icon={params.value ? <ActiveIcon /> : <BlockIcon />}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => onViewDetails(params.row._id)}
            title="View Details"
          >
            <ViewIcon fontSize="small" />
          </IconButton>
          {onToggleStatus && (
            <IconButton
              size="small"
              color={params.row.isActive ? 'warning' : 'success'}
              onClick={() => onToggleStatus(params.row._id, params.row.isActive)}
              title={params.row.isActive ? 'Disable Account' : 'Enable Account'}
            >
              {params.row.isActive ? <BlockIcon fontSize="small" /> : <ActiveIcon fontSize="small" />}
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  const rows = customers.map((customer) => ({
    id: customer._id,
    _id: customer._id,
    name: customer.firstName && customer.lastName
      ? `${customer.firstName} ${customer.lastName}`
      : customer.email,
    email: customer.email,
    phone: customer.phone || 'N/A',
    createdAt: customer.createdAt,
    totalOrders: customer.totalOrders || 0,
    lifetimeValue: customer.lifetimeValue || 0,
    isActive: customer.isActive,
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

export default CustomersTable;
