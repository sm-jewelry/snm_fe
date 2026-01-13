import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import {
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  AccessTime as UptimeIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import StatsCard from '../common/StatsCard';

interface SystemMetricsCardsProps {
  healthData: any;
  metricsData: string;
}

const SystemMetricsCards: React.FC<SystemMetricsCardsProps> = ({
  healthData,
  metricsData,
}) => {
  // Parse metrics data with more flexible matching
  const parseMetric = (metricName: string): number => {
    if (!metricsData) return 0;
    
    // Try different patterns to match the metric
    const patterns = [
      new RegExp(`${metricName}\\s+(\\d+\\.?\\d*)`, 'i'),
      new RegExp(`${metricName}\\{[^}]*\\}\\s+(\\d+\\.?\\d*)`, 'i'),
      new RegExp(`${metricName}[\\s{].*?\\s+(\\d+\\.?\\d*)`, 'i'),
    ];
    
    for (const pattern of patterns) {
      const match = metricsData.match(pattern);
      if (match) return parseFloat(match[1]);
    }
    
    return 0;
  };

  // Calculate average response time
  const avgResponseTime =
    healthData?.checks?.services?.reduce((sum: number, s: any) => {
      const time = parseInt(s.responseTime) || 0;
      return sum + time;
    }, 0) / (healthData?.checks?.services?.length || 1);

  // Get memory usage
  const memoryUsage = parseMetric('snm_gateway_process_resident_memory_bytes');
  const memoryMB = Math.round(memoryUsage / 1024 / 1024);

  // Get uptime
  const uptime = healthData?.uptime || 0;
  const uptimeHours = Math.floor(uptime / 3600);
  const uptimeMinutes = Math.floor((uptime % 3600) / 60);

  // Get total active requests (since there's no http_requests_total in your metrics)
  const totalRequests = 
    parseMetric('snm_gateway_nodejs_active_requests_total') ||
    parseMetric('snm_gateway_nodejs_active_resources_total') ||
    0;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
        System Metrics
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Avg Response Time"
            value={`${Math.round(avgResponseTime)}ms`}
            icon={<SpeedIcon />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Memory Usage"
            value={memoryMB > 0 ? `${memoryMB}MB` : 'N/A'}
            icon={<MemoryIcon />}
            color="info"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Gateway Uptime"
            value={`${uptimeHours}h ${uptimeMinutes}m`}
            icon={<UptimeIcon />}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Total Requests"
            value={totalRequests > 0 ? totalRequests.toLocaleString() : 'N/A'}
            icon={<TrendingUpIcon />}
            color="secondary"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemMetricsCards;