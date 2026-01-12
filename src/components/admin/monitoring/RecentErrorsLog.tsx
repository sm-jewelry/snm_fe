import React from 'react';
import { useRouter } from 'next/router';
import {
  Paper,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  Button,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';

// Mock data - In production, this would come from your logging system
const mockErrors = [
  {
    id: 1,
    level: 'error',
    message: 'Database connection timeout',
    timestamp: '2 minutes ago',
    service: 'order-service',
  },
  {
    id: 2,
    level: 'warning',
    message: 'High memory usage detected',
    timestamp: '5 minutes ago',
    service: 'api-gateway',
  },
  {
    id: 3,
    level: 'info',
    message: 'Service restart completed successfully',
    timestamp: '10 minutes ago',
    service: 'catalog-service',
  },
];

const RecentErrorsLog: React.FC = () => {
  const router = useRouter();

  const getIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      case 'warning':
        return <WarningIcon sx={{ color: 'warning.main' }} />;
      case 'info':
        return <InfoIcon sx={{ color: 'info.main' }} />;
      default:
        return <InfoIcon />;
    }
  };

  const getColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Paper>
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={700}>
          Recent Events & Logs
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Latest system events, warnings, and errors
        </Typography>
      </Box>

      {mockErrors.length === 0 ? (
        <Box sx={{ p: 3 }}>
          <Alert severity="success">
            No recent errors or warnings. All systems running smoothly!
          </Alert>
        </Box>
      ) : (
        <List>
          {mockErrors.map((error, index) => (
            <ListItem
              key={error.id}
              sx={{
                borderBottom: index < mockErrors.length - 1 ? 1 : 0,
                borderColor: 'divider',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <Box sx={{ mr: 2 }}>{getIcon(error.level)}</Box>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {error.message}
                    </Typography>
                    <Chip
                      label={error.level.toUpperCase()}
                      size="small"
                      color={getColor(error.level) as any}
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Service: {error.service}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {error.timestamp}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      <Box
        sx={{
          p: 2,
          textAlign: 'center',
          borderTop: 1,
          borderColor: 'divider',
          backgroundColor: 'action.hover',
        }}
      >
        <Button
          variant="text"
          color="primary"
          endIcon={<OpenInNewIcon />}
          onClick={() => router.push('/admin/logs')}
          sx={{ fontWeight: 600 }}
        >
          View All Logs
        </Button>
      </Box>
    </Paper>
  );
};

export default RecentErrorsLog;
