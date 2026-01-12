import React from 'react';
import { Paper, Box, Typography, Chip } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';

interface ServiceHealthCardProps {
  service: {
    name: string;
    status: 'healthy' | 'unhealthy';
    responseTime: string;
    statusCode?: number;
    error?: string;
  };
}

const ServiceHealthCard: React.FC<ServiceHealthCardProps> = ({ service }) => {
  const isHealthy = service.status === 'healthy';

  return (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        border: 2,
        borderColor: isHealthy ? 'success.main' : 'error.main',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: isHealthy ? 'success.main' : 'error.main',
        },
      }}
    >
      {/* Status Icon */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 2,
        }}
      >
        <Box>
          {isHealthy ? (
            <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
          ) : (
            <ErrorIcon sx={{ fontSize: 40, color: 'error.main' }} />
          )}
        </Box>
        <Chip
          label={service.status.toUpperCase()}
          size="small"
          sx={{
            backgroundColor: isHealthy ? 'success.light' : 'error.light',
            color: isHealthy ? 'success.dark' : 'error.dark',
            fontWeight: 700,
          }}
        />
      </Box>

      {/* Service Name */}
      <Typography variant="h6" fontWeight={700} gutterBottom>
        {service.name
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')}
      </Typography>

      {/* Response Time */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
        <SpeedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
        <Typography variant="body2" color="text.secondary">
          Response Time:
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {service.responseTime}
        </Typography>
      </Box>

      {/* Status Code or Error */}
      {isHealthy ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Status Code: {service.statusCode}
        </Typography>
      ) : (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          Error: {service.error || 'Unknown error'}
        </Typography>
      )}
    </Paper>
  );
};

export default ServiceHealthCard;
