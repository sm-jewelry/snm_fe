import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Chip,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

interface ComparisonMetric {
  label: string;
  currentValue: number;
  previousValue: number;
  format?: 'currency' | 'number' | 'percentage';
  decimals?: number;
}

interface ComparisonViewProps {
  currentPeriodLabel: string;
  previousPeriodLabel: string;
  metrics: ComparisonMetric[];
}

const ComparisonView: React.FC<ComparisonViewProps> = ({
  currentPeriodLabel,
  previousPeriodLabel,
  metrics,
}) => {
  const theme = useTheme();

  const formatValue = (value: number, format?: string, decimals: number = 0) => {
    switch (format) {
      case 'currency':
        return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: decimals })}`;
      case 'percentage':
        return `${value.toFixed(decimals)}%`;
      case 'number':
      default:
        return value.toLocaleString('en-IN', { maximumFractionDigits: decimals });
    }
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp />;
    if (change < 0) return <TrendingDown />;
    return <TrendingFlat />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return theme.palette.success.main;
    if (change < 0) return theme.palette.error.main;
    return theme.palette.text.secondary;
  };

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Period Comparison
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Compare {currentPeriodLabel} vs {previousPeriodLabel}
        </Typography>

        <Grid container spacing={3}>
          {metrics.map((metric, index) => {
            const change = calculateChange(metric.currentValue, metric.previousValue);
            const trendColor = getTrendColor(change);
            const trendIcon = getTrendIcon(change);

            return (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.1)}`,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    },
                  }}
                >
                  <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
                    {metric.label}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                    <Typography variant="h5" fontWeight={700} color="primary">
                      {formatValue(metric.currentValue, metric.format, metric.decimals)}
                    </Typography>
                    <Chip
                      icon={trendIcon}
                      label={`${change > 0 ? '+' : ''}${change.toFixed(1)}%`}
                      size="small"
                      sx={{
                        height: 24,
                        backgroundColor: alpha(trendColor, 0.1),
                        color: trendColor,
                        border: `1px solid ${alpha(trendColor, 0.3)}`,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    />
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {previousPeriodLabel}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="text.secondary">
                      {formatValue(metric.previousValue, metric.format, metric.decimals)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ComparisonView;
