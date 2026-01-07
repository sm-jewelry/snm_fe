import React from 'react';
import { Box, Typography, Paper, Stack, Chip } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';

interface StatusData {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

interface OrderStatusChartProps {
  data?: StatusData[];
  loading?: boolean;
}

/**
 * OrderStatusChart - Enhanced Donut Chart
 * Displays order status distribution as a beautiful donut chart
 * Shows: Pending, Processing, Shipped, Delivered, Cancelled
 */
const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ data, loading = false }) => {
  const theme = useTheme();

  // Enhanced colors with better vibrancy
  const defaultColors = {
    pending: '#ff9800',    // Orange
    processing: '#2196f3', // Blue
    shipped: '#9c27b0',    // Purple
    delivered: '#4caf50',  // Green
    cancelled: '#f44336',  // Red
  };

  // Use provided data or generate mock data
  const chartData: StatusData[] = data && data.length > 0 ? data : [
    { name: 'Pending', value: 24, color: defaultColors.pending },
    { name: 'Processing', value: 38, color: defaultColors.processing },
    { name: 'Shipped', value: 28, color: defaultColors.shipped },
    { name: 'Delivered', value: 156, color: defaultColors.delivered },
    { name: 'Cancelled', value: 8, color: defaultColors.cancelled },
  ];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Custom label renderer for outside labels with percentage
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.03) return null; // Don't show label if slice is too small

    return (
      <text
        x={x}
        y={y}
        fill={theme.palette.text.primary}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontSize: '0.875rem', fontWeight: 600 }}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  // Custom center label showing total
  const renderCenterLabel = () => (
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      dominantBaseline="central"
    >
      <tspan
        x="50%"
        dy="-0.5em"
        style={{
          fontSize: '2rem',
          fontWeight: 700,
          fill: theme.palette.text.primary,
        }}
      >
        {total}
      </tspan>
      <tspan
        x="50%"
        dy="1.8em"
        style={{
          fontSize: '0.875rem',
          fontWeight: 500,
          fill: theme.palette.text.secondary,
        }}
      >
        Total Orders
      </tspan>
    </text>
  );

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
        <DonutLargeIcon sx={{ color: theme.palette.secondary.main, fontSize: '1.5rem' }} />
        <Typography variant="h1" fontWeight={600}>
          Order Status Distribution
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
        {chartData.map((item) => (
          <Chip
            key={item.name}
            label={`${item.name}: ${item.value}`}
            size="small"
            sx={{
              backgroundColor: alpha(item.color, 0.1),
              color: item.color,
              fontWeight: 600,
              fontSize: '0.75rem',
              borderLeft: `3px solid ${item.color}`,
              borderRadius: 1,
            }}
          />
        ))}
      </Stack>

      <Box sx={{ flexGrow: 1, minHeight: 350, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={{
                stroke: theme.palette.text.secondary,
                strokeWidth: 1,
              }}
              label={renderCustomLabel}
              innerRadius="60%"
              outerRadius="85%"
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={theme.palette.background.paper}
                  strokeWidth={3}
                />
              ))}
            </Pie>
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
                marginBottom: 4,
                color: theme.palette.text.primary,
              }}
              formatter={(value: number, name: string, props: any) => [
                `${value} orders (${((value / total) * 100).toFixed(1)}%)`,
                name,
              ]}
              itemStyle={{
                color: theme.palette.text.secondary,
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={50}
              iconType="circle"
              wrapperStyle={{
                fontSize: '0.875rem',
                fontWeight: 500,
                paddingTop: '10px',
              }}
              formatter={(value, entry: any) => (
                <span style={{ color: theme.palette.text.primary, marginLeft: 4 }}>
                  {value}
                </span>
              )}
            />
            {renderCenterLabel()}
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default OrderStatusChart;
