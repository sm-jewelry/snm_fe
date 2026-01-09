import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  AccountBalanceWallet,
  People,
  Repeat,
  LocalShipping,
  CheckCircle,
} from '@mui/icons-material';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: string;
  progress?: number;
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  color,
  progress,
  subtitle,
}) => {
  const theme = useTheme();
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px ${alpha(color, 0.2)}`,
          border: `1px solid ${alpha(color, 0.4)}`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: `0 4px 12px ${alpha(color, 0.3)}`,
            }}
          >
            {icon}
          </Box>
          {change !== undefined && (
            <Chip
              icon={isPositive ? <TrendingUp /> : <TrendingDown />}
              label={`${isPositive ? '+' : ''}${change.toFixed(1)}%`}
              size="small"
              sx={{
                backgroundColor: isPositive
                  ? alpha(theme.palette.success.main, 0.1)
                  : alpha(theme.palette.error.main, 0.1),
                color: isPositive ? theme.palette.success.main : theme.palette.error.main,
                fontWeight: 600,
                border: `1px solid ${isPositive ? alpha(theme.palette.success.main, 0.3) : alpha(theme.palette.error.main, 0.3)}`,
              }}
            />
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
          {title}
        </Typography>

        <Typography variant="h4" fontWeight={700} sx={{ mb: 1, color }}>
          {value}
        </Typography>

        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}

        {changeLabel && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {changeLabel}
          </Typography>
        )}

        {progress !== undefined && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: alpha(color, 0.1),
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
                  borderRadius: 3,
                },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {progress.toFixed(0)}% of target
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

interface AdvancedMetricsProps {
  orders: any[];
  customers: any[];
  previousPeriodOrders?: any[];
}

const AdvancedMetrics: React.FC<AdvancedMetricsProps> = ({
  orders,
  customers,
  previousPeriodOrders = [],
}) => {
  const theme = useTheme();

  // Calculate metrics
  const totalRevenue = orders.reduce((sum, order) => sum + (order.amount || order.total || 0), 0);
  const totalOrders = orders.length;
  const totalCustomers = customers.length;

  // Average Order Value
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Conversion Rate (orders / customers * 100)
  const conversionRate = totalCustomers > 0 ? (totalOrders / totalCustomers) * 100 : 0;

  // Returning Customers (customers with more than 1 order)
  const returningCustomers = customers.filter((c) => (c.totalOrders || 0) > 1).length;
  const customerRetentionRate = totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;

  // Order Fulfillment Rate
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
  const fulfillmentRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;

  // Calculate changes compared to previous period
  const prevRevenue = previousPeriodOrders.reduce((sum, order) => sum + (order.amount || order.total || 0), 0);
  const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

  const prevOrders = previousPeriodOrders.length;
  const ordersChange = prevOrders > 0 ? ((totalOrders - prevOrders) / prevOrders) * 100 : 0;

  const prevAOV = prevOrders > 0 ? prevRevenue / prevOrders : 0;
  const aovChange = prevAOV > 0 ? ((averageOrderValue - prevAOV) / prevAOV) * 100 : 0;

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Revenue */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString('en-IN')}`}
            change={revenueChange}
            changeLabel="vs last period"
            icon={<AccountBalanceWallet />}
            color={theme.palette.success.main}
          />
        </Grid>

        {/* Average Order Value */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Average Order Value"
            value={`₹${Math.round(averageOrderValue).toLocaleString('en-IN')}`}
            change={aovChange}
            changeLabel="vs last period"
            icon={<ShoppingCart />}
            color={theme.palette.primary.main}
            subtitle={`From ${totalOrders} orders`}
          />
        </Grid>

        {/* Conversion Rate */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Conversion Rate"
            value={`${conversionRate.toFixed(1)}%`}
            icon={<TrendingUp />}
            color={theme.palette.info.main}
            progress={conversionRate}
            subtitle={`${totalOrders} orders / ${totalCustomers} customers`}
          />
        </Grid>

        {/* Customer Retention */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Customer Retention"
            value={`${customerRetentionRate.toFixed(1)}%`}
            icon={<Repeat />}
            color={theme.palette.secondary.main}
            progress={customerRetentionRate}
            subtitle={`${returningCustomers} returning customers`}
          />
        </Grid>

        {/* Total Orders */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Orders"
            value={totalOrders.toLocaleString('en-IN')}
            change={ordersChange}
            changeLabel="vs last period"
            icon={<ShoppingCart />}
            color={theme.palette.warning.main}
          />
        </Grid>

        {/* Total Customers */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Customers"
            value={totalCustomers.toLocaleString('en-IN')}
            icon={<People />}
            color={theme.palette.info.main}
            subtitle={`${customers.filter((c) => c.isActive).length} active`}
          />
        </Grid>

        {/* Order Fulfillment */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Order Fulfillment"
            value={`${fulfillmentRate.toFixed(1)}%`}
            icon={<LocalShipping />}
            color={theme.palette.primary.main}
            progress={fulfillmentRate}
            subtitle={`${deliveredOrders} delivered orders`}
          />
        </Grid>

        {/* Success Rate */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Success Rate"
            value={`${(100 - orders.filter((o) => o.status === 'cancelled').length / totalOrders * 100).toFixed(1)}%`}
            icon={<CheckCircle />}
            color={theme.palette.success.main}
            progress={100 - (orders.filter((o) => o.status === 'cancelled').length / totalOrders) * 100}
            subtitle={`${orders.filter((o) => o.status === 'cancelled').length} cancelled`}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdvancedMetrics;
