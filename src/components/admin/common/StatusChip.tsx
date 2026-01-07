import React from 'react';
import { Chip, ChipProps } from '@mui/material';

type StatusType =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'active'
  | 'inactive'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'completed'
  | 'failed';

interface StatusChipProps {
  status: StatusType;
  size?: ChipProps['size'];
  variant?: ChipProps['variant'];
}

const statusConfig: Record<StatusType, { label: string; color: ChipProps['color'] }> = {
  pending: { label: 'Pending', color: 'warning' },
  approved: { label: 'Approved', color: 'success' },
  rejected: { label: 'Rejected', color: 'error' },
  active: { label: 'Active', color: 'success' },
  inactive: { label: 'Inactive', color: 'default' },
  processing: { label: 'Processing', color: 'info' },
  shipped: { label: 'Shipped', color: 'info' },
  delivered: { label: 'Delivered', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'error' },
  completed: { label: 'Completed', color: 'success' },
  failed: { label: 'Failed', color: 'error' },
};

/**
 * StatusChip Component
 * Colored badge for displaying status consistently across the admin panel
 */
const StatusChip: React.FC<StatusChipProps> = ({
  status,
  size = 'small',
  variant = 'filled',
}) => {
  const config = statusConfig[status] || { label: status, color: 'default' as const };

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      variant={variant}
      sx={{
        fontWeight: 600,
        fontSize: size === 'small' ? '0.75rem' : '0.875rem',
      }}
    />
  );
};

export default StatusChip;
