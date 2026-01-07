import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

interface SalesChartProps {
  data?: SalesData[];
  loading?: boolean;
}

/**
 * SalesChart - Enhanced with gradient fills and improved UI
 * Displays revenue and order trends over time using Recharts
 * Responsive and theme-aware with beautiful gradients
 */
const SalesChart: React.FC<SalesChartProps> = ({ data = [], loading = false }) => {
  const theme = useTheme();

  // Generate mock data if no data provided (for demonstration)
  const chartData = data.length > 0 ? data : generateMockData();

  // Calculate totals for display
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = chartData.reduce((sum, item) => sum + item.orders, 0);

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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <TrendingUpIcon sx={{ color: theme.palette.primary.main, fontSize: '2rem' }} />
            <Typography variant="h1" fontWeight={700}>
              Revenue & Orders Trend
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.8, ml: 5 }}>
            Last 30 days performance
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" color="text.secondary" display="block" fontWeight={500}>
            Total Revenue
          </Typography>
          <Typography variant="h4" fontWeight={700} color="primary.main" sx={{ my: 0.5 }}>
            ₹{totalRevenue.toLocaleString('en-IN')}
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {totalOrders} orders
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, minHeight: { xs: 350, sm: 450, md: 550 } }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 15, right: 15, left: 5, bottom: 10 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.palette.mode === 'dark' ? alpha(theme.palette.divider, 0.2) : alpha(theme.palette.divider, 0.5)}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke={theme.palette.text.secondary}
              style={{ fontSize: '0.8rem', fontWeight: 500 }}
              tickLine={false}
              axisLine={{ stroke: theme.palette.divider }}
            />
            <YAxis
              yAxisId="left"
              stroke={theme.palette.primary.main}
              style={{ fontSize: '0.85rem', fontWeight: 500 }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={theme.palette.secondary.main}
              style={{ fontSize: '0.85rem', fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: alpha(theme.palette.background.paper, 0.95),
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 12,
                padding: '12px 16px',
                boxShadow: theme.shadows[8],
              }}
              labelStyle={{
                fontWeight: 600,
                marginBottom: 8,
                color: theme.palette.text.primary,
              }}
              formatter={(value: number, name: string) => {
                if (name === 'Revenue') {
                  return [`₹${value.toLocaleString('en-IN')}`, 'Revenue'];
                }
                return [value, 'Orders'];
              }}
              cursor={{ stroke: theme.palette.divider, strokeWidth: 1, strokeDasharray: '5 5' }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '0.9rem',
                fontWeight: 500,
              }}
              iconType="circle"
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke={theme.palette.primary.main}
              strokeWidth={3}
              fill="url(#colorRevenue)"
              fillOpacity={1}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2, fill: theme.palette.background.paper }}
              name="Revenue"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              stroke={theme.palette.secondary.main}
              strokeWidth={3}
              fill="url(#colorOrders)"
              fillOpacity={1}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2, fill: theme.palette.background.paper }}
              name="Orders"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

// Generate realistic mock data with growth trend
function generateMockData(): SalesData[] {
  const data: SalesData[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Create a realistic trend with some variance
    const dayIndex = 29 - i;
    const growthFactor = 1 + (dayIndex * 0.015); // 1.5% daily growth trend
    const weekendFactor = [0, 6].includes(date.getDay()) ? 0.7 : 1; // Lower on weekends
    const variance = 0.85 + Math.random() * 0.3; // ±15% random variance

    const baseRevenue = 60000 * growthFactor * weekendFactor * variance;
    const baseOrders = Math.floor((15 * growthFactor * weekendFactor * variance));

    data.push({
      date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      revenue: Math.round(baseRevenue),
      orders: baseOrders,
    });
  }

  return data;
}

export default SalesChart;
