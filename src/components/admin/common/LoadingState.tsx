import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Skeleton,
  Stack,
} from '@mui/material';

interface LoadingStateProps {
  type?: 'spinner' | 'skeleton';
  message?: string;
  rows?: number;
}

/**
 * LoadingState Component
 * Consistent loading indicators and skeleton loaders
 */
const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'spinner',
  message = 'Loading...',
  rows = 5,
}) => {
  if (type === 'skeleton') {
    return (
      <Box sx={{ width: '100%' }}>
        <Stack spacing={1}>
          {Array.from({ length: rows }).map((_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              height={60}
              sx={{ borderRadius: 1 }}
            />
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        gap: 2,
      }}
    >
      <CircularProgress size={48} />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingState;
