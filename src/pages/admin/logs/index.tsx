import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  MenuItem,
  Chip,
  Alert,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import LoadingState from '../../../components/admin/common/LoadingState';
import LogsTable from '../../../components/admin/logs/LogsTable';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

export interface LogEntry {
  id: string;
  level: 'error' | 'warning' | 'info' | 'debug';
  message: string;
  timestamp: string;
  service: string;
  details?: string;
}

const LogsPage = () => {
  const router = useRouter();
  const { loading: authLoading, user } = useAdminAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Mock data for now - In production, fetch from API
  const mockLogs: LogEntry[] = [
    {
      id: '1',
      level: 'error',
      message: 'Database connection timeout',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      service: 'order-service',
      details: 'Connection attempt to PostgreSQL database timed out after 30 seconds',
    },
    {
      id: '2',
      level: 'warning',
      message: 'High memory usage detected',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      service: 'api-gateway',
      details: 'Memory usage at 85% of allocated heap',
    },
    {
      id: '3',
      level: 'info',
      message: 'Service restart completed successfully',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      service: 'catalog-service',
      details: 'Service restarted and all health checks passed',
    },
    {
      id: '4',
      level: 'error',
      message: 'Payment processing failed',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      service: 'payment-service',
      details: 'Payment gateway returned error code 5001',
    },
    {
      id: '5',
      level: 'warning',
      message: 'Slow API response detected',
      timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      service: 'api-gateway',
      details: 'Request to /api/products took 5.2 seconds',
    },
    {
      id: '6',
      level: 'debug',
      message: 'Cache invalidation triggered',
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      service: 'catalog-service',
      details: 'Product cache cleared for category: electronics',
    },
    {
      id: '7',
      level: 'info',
      message: 'New order received',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      service: 'order-service',
      details: 'Order #12345 created successfully',
    },
    {
      id: '8',
      level: 'error',
      message: 'Failed to send notification email',
      timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      service: 'notification-service',
      details: 'SMTP connection refused',
    },
  ];

  // Fetch logs
  const fetchLogs = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch(`${API_GATEWAY_URL}/logs`);
      // const data = await response.json();
      // setLogs(data);

      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 500));
      setLogs(mockLogs);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch logs');
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (!authLoading && user) {
      fetchLogs();
    }
  }, [authLoading, user]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchLogs();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Filter logs
  useEffect(() => {
    let filtered = [...logs];

    // Level filter
    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    // Service filter
    if (serviceFilter !== 'all') {
      filtered = filtered.filter(log => log.service === serviceFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(query) ||
        log.service.toLowerCase().includes(query) ||
        log.details?.toLowerCase().includes(query)
      );
    }

    setFilteredLogs(filtered);
  }, [logs, levelFilter, serviceFilter, searchQuery]);

  // Get unique services
  const services = Array.from(new Set(logs.map(log => log.service)));

  // Download logs
  const handleDownloadLogs = () => {
    const logsText = filteredLogs.map(log =>
      `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.service}] ${log.message}${log.details ? '\n  Details: ' + log.details : ''}`
    ).join('\n\n');

    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (authLoading) {
    return <LoadingState message="Verifying admin access..." />;
  }

  if (loading) {
    return <LoadingState message="Loading logs..." />;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/admin/monitoring')}
            variant="outlined"
            size="small"
          >
            Back to Monitoring
          </Button>
        </Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          System Logs
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and analyze system logs from all microservices
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters and Actions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <TextField
            placeholder="Search logs..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: 250 }}
          />

          {/* Level Filter */}
          <TextField
            select
            label="Level"
            size="small"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Levels</MenuItem>
            <MenuItem value="error">Error</MenuItem>
            <MenuItem value="warning">Warning</MenuItem>
            <MenuItem value="info">Info</MenuItem>
            <MenuItem value="debug">Debug</MenuItem>
          </TextField>

          {/* Service Filter */}
          <TextField
            select
            label="Service"
            size="small"
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">All Services</MenuItem>
            {services.map(service => (
              <MenuItem key={service} value={service}>{service}</MenuItem>
            ))}
          </TextField>

          <Box sx={{ ml: 'auto', display: 'flex', gap: 2 }}>
            {/* Results Count */}
            <Chip
              label={`${filteredLogs.length} logs`}
              color="primary"
              variant="outlined"
            />

            {/* Auto Refresh */}
            <Button
              variant={autoRefresh ? 'contained' : 'outlined'}
              onClick={() => setAutoRefresh(!autoRefresh)}
              size="small"
            >
              {autoRefresh ? 'Auto-Refresh: ON' : 'Auto-Refresh: OFF'}
            </Button>

            {/* Refresh Button */}
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchLogs}
              size="small"
            >
              Refresh
            </Button>

            {/* Download Button */}
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadLogs}
              size="small"
            >
              Download
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Logs Table */}
      <LogsTable logs={filteredLogs} />
    </Box>
  );
};

export default LogsPage;
