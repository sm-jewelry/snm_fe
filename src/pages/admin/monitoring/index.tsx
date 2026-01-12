import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Chip,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import LoadingState from '../../../components/admin/common/LoadingState';
import ServiceHealthCard from '../../../components/admin/monitoring/ServiceHealthCard';
import MetricsChart from '../../../components/admin/monitoring/MetricsChart';
import ServiceStatusTable from '../../../components/admin/monitoring/ServiceStatusTable';
import RecentErrorsLog from '../../../components/admin/monitoring/RecentErrorsLog';
import SystemMetricsCards from '../../../components/admin/monitoring/SystemMetricsCards';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy';
  responseTime: string;
  statusCode?: number;
  error?: string;
  code?: string;
}

interface HealthData {
  status: string;
  service: string;
  timestamp: string;
  uptime: number;
  checks?: {
    services: ServiceHealth[];
  };
}

const MonitoringPage = () => {
  const { loading: authLoading, user } = useAdminAuth();
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [metricsData, setMetricsData] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch health data
  const fetchHealthData = async () => {
    try {
      const response = await fetch(`${API_GATEWAY_URL}/health/ready`);
      const data = await response.json();
      setHealthData(data);
      setError(null);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to fetch health data');
      console.error('Error fetching health data:', err);
    }
  };

  // Fetch metrics data
  const fetchMetricsData = async () => {
    try {
      const response = await fetch(`${API_GATEWAY_URL}/metrics`);
      const text = await response.text();
      setMetricsData(text);
    } catch (err: any) {
      console.error('Error fetching metrics:', err);
    }
  };

  // Initial load
  useEffect(() => {
    if (!authLoading && user) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchHealthData(), fetchMetricsData()]);
        setLoading(false);
      };
      loadData();
    }
  }, [authLoading, user]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchHealthData();
      fetchMetricsData();
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Manual refresh
  const handleRefresh = () => {
    fetchHealthData();
    fetchMetricsData();
  };

  // Download metrics
  const handleDownloadMetrics = () => {
    const blob = new Blob([metricsData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metrics-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (authLoading) {
    return <LoadingState message="Verifying admin access..." />;
  }

  if (loading) {
    return <LoadingState message="Loading monitoring data..." />;
  }

  const allHealthy = healthData?.checks?.services.every(s => s.status === 'healthy') ?? false;
  const services = healthData?.checks?.services || [];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            System Monitoring
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time monitoring of all microservices and system health
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            size="small"
          >
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? 'contained' : 'outlined'}
            onClick={() => setAutoRefresh(!autoRefresh)}
            size="small"
          >
            {autoRefresh ? 'Auto-Refresh: ON' : 'Auto-Refresh: OFF'}
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Overall Status Banner */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          background: allHealthy
            ? 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)'
            : 'linear-gradient(135deg, #f44336 0%, #e57373 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {allHealthy ? (
            <CheckCircleIcon sx={{ fontSize: 48 }} />
          ) : (
            <ErrorIcon sx={{ fontSize: 48 }} />
          )}
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {allHealthy ? 'All Systems Operational' : 'System Issues Detected'}
            </Typography>
            <Typography variant="body1">
              {allHealthy
                ? 'All microservices are running smoothly'
                : `${services.filter(s => s.status === 'unhealthy').length} service(s) experiencing issues`}
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <Chip
              label={healthData?.status?.toUpperCase()}
              sx={{
                backgroundColor: 'white',
                color: allHealthy ? '#4caf50' : '#f44336',
                fontWeight: 700,
                fontSize: '1rem',
                px: 2,
                py: 3,
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* System Metrics Cards */}
      <SystemMetricsCards
        healthData={healthData}
        metricsData={metricsData}
      />

      {/* Service Health Cards */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
          Microservices Health
        </Typography>
        <Grid container spacing={3}>
          {services.map((service) => (
            <Grid size={{xs:12, sm:6 ,md:4 ,lg:3}} key={service.name}>
              <ServiceHealthCard service={service} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Service Status Table */}
      <Box sx={{ mb: 4 }}>
        <ServiceStatusTable services={services} />
      </Box>

      {/* Metrics Chart */}
      <Box sx={{ mb: 4 }}>
        <MetricsChart metricsData={metricsData} />
      </Box>

      {/* Recent Errors Log */}
      <Box sx={{ mb: 4 }}>
        <RecentErrorsLog />
      </Box>

      {/* Quick Actions */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadMetrics}
          >
            Download Metrics
          </Button>
          <Button
            variant="outlined"
            onClick={() => window.open(`${API_GATEWAY_URL}/status`, '_blank')}
          >
            Open Real-Time Dashboard
          </Button>
          <Button
            variant="outlined"
            onClick={() => window.open(`${API_GATEWAY_URL}/metrics`, '_blank')}
          >
            View Raw Metrics
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default MonitoringPage;
