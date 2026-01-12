import React, { useMemo } from 'react';
import {
  Paper,
  Box,
  Typography,
  Grid,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';

interface MetricsChartProps {
  metricsData: string;
}

const MetricsChart: React.FC<MetricsChartProps> = ({ metricsData }) => {
  // Parse metrics from Prometheus format
  const metrics = useMemo(() => {
    const parseMetric = (name: string): number => {
      const regex = new RegExp(`${name}\\s+(\\d+\\.?\\d*)`);
      const match = metricsData.match(regex);
      return match ? parseFloat(match[1]) : 0;
    };

    const cpuUser = parseMetric('snm_gateway_process_cpu_user_seconds_total');
    const cpuSystem = parseMetric('snm_gateway_process_cpu_system_seconds_total');
    const heapUsed = parseMetric('snm_gateway_process_heap_bytes');
    const heapTotal = parseMetric('nodejs_heap_size_total_bytes');
    const rss = parseMetric('snm_gateway_process_resident_memory_bytes');

    return {
      cpu: {
        user: cpuUser,
        system: cpuSystem,
        total: cpuUser + cpuSystem,
        percentage: Math.min(((cpuUser + cpuSystem) / 10) * 100, 100), // Approximate
      },
      memory: {
        heapUsed: Math.round(heapUsed / 1024 / 1024),
        heapTotal: Math.round(heapTotal / 1024 / 1024),
        rss: Math.round(rss / 1024 / 1024),
        percentage: heapTotal > 0 ? (heapUsed / heapTotal) * 100 : 0,
      },
    };
  }, [metricsData]);

  const MetricBar = ({
    label,
    value,
    percentage,
    color,
    icon,
  }: {
    label: string;
    value: string;
    percentage: number;
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    icon: React.ReactNode;
  }) => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon}
          <Typography variant="body2" fontWeight={600}>
            {label}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {value}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={Math.min(percentage, 100)}
        color={color}
        sx={{ height: 8, borderRadius: 4 }}
      />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 0.5, display: 'block' }}
      >
        {Math.round(percentage)}% utilized
      </Typography>
    </Box>
  );

  return (
    <Paper>
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={700}>
          Performance Metrics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Real-time resource usage and performance indicators
        </Typography>
      </Box>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* CPU Usage */}
          <Grid size={{ xs: 12, md: 6 }}>
            <MetricBar
              label="CPU Usage"
              value={`${metrics.cpu.total.toFixed(2)}s`}
              percentage={metrics.cpu.percentage}
              color={metrics.cpu.percentage > 80 ? 'error' : metrics.cpu.percentage > 60 ? 'warning' : 'success'}
              icon={<SpeedIcon sx={{ fontSize: 20, color: 'primary.main' }} />}
            />
          </Grid>

          {/* Memory Usage */}
          <Grid size={{ xs: 12, md: 6 }}>
            <MetricBar
              label="Memory Usage (Heap)"
              value={`${metrics.memory.heapUsed}MB / ${metrics.memory.heapTotal}MB`}
              percentage={metrics.memory.percentage}
              color={metrics.memory.percentage > 80 ? 'error' : metrics.memory.percentage > 60 ? 'warning' : 'primary'}
              icon={<MemoryIcon sx={{ fontSize: 20, color: 'info.main' }} />}
            />
          </Grid>

          {/* RSS Memory */}
          <Grid size={{ xs: 12, md: 6 }}>
            <MetricBar
              label="Resident Set Size (RSS)"
              value={`${metrics.memory.rss}MB`}
              percentage={(metrics.memory.rss / 512) * 100}
              color="secondary"
              icon={<StorageIcon sx={{ fontSize: 20, color: 'secondary.main' }} />}
            />
          </Grid>

          {/* Request Trend (Placeholder) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <MetricBar
              label="Request Load"
              value="Normal"
              percentage={45}
              color="success"
              icon={<TrendingUpIcon sx={{ fontSize: 20, color: 'success.main' }} />}
            />
          </Grid>
        </Grid>

        {/* Additional Stats */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: 'action.hover', borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="text.secondary">
                CPU User Time
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {metrics.cpu.user.toFixed(2)}s
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="text.secondary">
                CPU System Time
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {metrics.cpu.system.toFixed(2)}s
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Heap Used
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {metrics.memory.heapUsed}MB
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Total RSS
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {metrics.memory.rss}MB
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Paper>
  );
};

export default MetricsChart;
