import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Box,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

interface ServiceStatusTableProps {
  services: Array<{
    name: string;
    status: 'healthy' | 'unhealthy';
    responseTime: string;
    statusCode?: number;
    error?: string;
  }>;
}

const ServiceStatusTable: React.FC<ServiceStatusTableProps> = ({ services }) => {
  return (
    <Paper>
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={700}>
          Service Status Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Real-time status of all microservices
        </Typography>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={700}>
                  Service Name
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={700}>
                  Status
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={700}>
                  Response Time
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={700}>
                  Status Code
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={700}>
                  Last Checked
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((service) => {
              const isHealthy = service.status === 'healthy';
              return (
                <TableRow
                  key={service.name}
                  sx={{
                    '&:hover': { backgroundColor: 'action.hover' },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {isHealthy ? (
                        <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main' }} />
                      ) : (
                        <ErrorIcon sx={{ fontSize: 20, color: 'error.main' }} />
                      )}
                      <Typography variant="body2" fontWeight={600}>
                        {service.name
                          .split('-')
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={service.status}
                      size="small"
                      sx={{
                        backgroundColor: isHealthy ? 'success.light' : 'error.light',
                        color: isHealthy ? 'success.dark' : 'error.dark',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        color: parseInt(service.responseTime) > 100 ? 'warning.main' : 'text.primary',
                        fontWeight: 500,
                      }}
                    >
                      {service.responseTime}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={isHealthy ? service.statusCode : service.error || 'Error'}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: isHealthy ? 'success.main' : 'error.main',
                        color: isHealthy ? 'success.main' : 'error.main',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      Just now
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ServiceStatusTable;
