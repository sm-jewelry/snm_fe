import React from 'react';
import { Box, Typography, Paper, Avatar, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { GridColDef } from '@mui/x-data-grid';
import DataTable from '../common/DataTable';
import { TrendingUp as TrendingIcon, EmojiEvents } from '@mui/icons-material';

interface TopProduct {
  _id: string;
  title: string;
  image?: string;
  salesCount: number;
  revenue: number;
  stock: number;
}

interface TopProductsTableProps {
  products?: TopProduct[];
  loading?: boolean;
  onProductClick?: (productId: string) => void;
}

/**
 * TopProductsTable
 * Displays top-selling products with sales count and revenue
 * Mini DataGrid for dashboard
 */
const TopProductsTable: React.FC<TopProductsTableProps> = ({
  products,
  loading = false,
  onProductClick,
}) => {
  const columns: GridColDef[] = [
    {
      field: 'rank',
      headerName: '#',
      width: 50,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value <= 3 ? 'primary' : 'default'}
          icon={params.value === 1 ? <TrendingIcon /> : undefined}
        />
      ),
    },
    {
      field: 'image',
      headerName: 'Image',
      width: 60,
      renderCell: (params) => (
        <Avatar src={params.value} alt={params.row.title} variant="rounded" />
      ),
      sortable: false,
    },
    {
      field: 'title',
      headerName: 'Product',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'salesCount',
      headerName: 'Sales',
      width: 80,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'revenue',
      headerName: 'Revenue',
      width: 120,
      renderCell: (params) => (
        <Typography fontWeight={600}>
          ₹{params.value.toLocaleString('en-IN')}
        </Typography>
      ),
    },
  ];

  // Use provided data or generate mock data
  const mockProducts: TopProduct[] = [
    { _id: '1', title: 'Diamond Necklace Set', image: '', salesCount: 45, revenue: 225000, stock: 12 },
    { _id: '2', title: 'Gold Earrings', image: '', salesCount: 38, revenue: 190000, stock: 25 },
    { _id: '3', title: 'Silver Bracelet', image: '', salesCount: 32, revenue: 96000, stock: 18 },
    { _id: '4', title: 'Pearl Ring', image: '', salesCount: 28, revenue: 140000, stock: 8 },
    { _id: '5', title: 'Platinum Chain', image: '', salesCount: 24, revenue: 360000, stock: 5 },
  ];

  const data = products || mockProducts;

  const rows = data.map((product, index) => ({
    id: product._id,
    rank: index + 1,
    image: product.image,
    title: product.title,
    salesCount: product.salesCount,
    revenue: product.revenue,
  }));

  const theme = useTheme();

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(145deg, #1e1e1e 0%, #2a2a2a 100%)'
          : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <EmojiEvents sx={{ color: theme.palette.secondary.main, fontSize: '1.5rem' }} />
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Top Selling Products
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Best performers this month
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          pageSize={5}
          autoHeight
          hideFooter
          onRowClick={(params) => onProductClick?.(params.row.id)}
        />
      </Box>
    </Paper>
  );
};

export default TopProductsTable;
