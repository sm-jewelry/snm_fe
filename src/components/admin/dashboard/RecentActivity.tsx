import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  ShoppingCart as OrderIcon,
  RateReview as ReviewIcon,
  PersonAdd as CustomerIcon,
  Inventory as ProductIcon,
  AccessTime,
} from '@mui/icons-material';

interface Activity {
  id: string;
  type: 'order' | 'review' | 'customer' | 'product';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'info' | 'error';
}

interface RecentActivityProps {
  activities?: Activity[];
  loading?: boolean;
}

/**
 * RecentActivity
 * Displays recent system activities (orders, reviews, customers, products)
 * Chronological list with icons and timestamps
 */
const RecentActivity: React.FC<RecentActivityProps> = ({ activities, loading = false }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <OrderIcon />;
      case 'review':
        return <ReviewIcon />;
      case 'customer':
        return <CustomerIcon />;
      case 'product':
        return <ProductIcon />;
      default:
        return <OrderIcon />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'primary';
      case 'review':
        return 'warning';
      case 'customer':
        return 'success';
      case 'product':
        return 'info';
      default:
        return 'default';
    }
  };

  // Mock data if no activities provided
  const mockActivities: Activity[] = [
    {
      id: '1',
      type: 'order',
      title: 'New Order #12345',
      description: 'Customer placed order for ₹45,000',
      timestamp: '2 minutes ago',
      status: 'success',
    },
    {
      id: '2',
      type: 'review',
      title: 'New Review Received',
      description: '5-star review for Diamond Necklace',
      timestamp: '15 minutes ago',
      status: 'warning',
    },
    {
      id: '3',
      type: 'customer',
      title: 'New Customer Registered',
      description: 'Priya Sharma joined',
      timestamp: '1 hour ago',
      status: 'success',
    },
    {
      id: '4',
      type: 'order',
      title: 'Order #12344 Shipped',
      description: 'Order dispatched to Mumbai',
      timestamp: '2 hours ago',
      status: 'info',
    },
    {
      id: '5',
      type: 'product',
      title: 'Low Stock Alert',
      description: 'Gold Earrings - Only 3 left',
      timestamp: '3 hours ago',
      status: 'error',
    },
  ];

  const data = activities || mockActivities;
  const theme = useTheme();

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(145deg, #1e1e1e 0%, #2a2a2a 100%)'
          : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <AccessTime sx={{ color: theme.palette.info.main, fontSize: '1.5rem' }} />
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Recent Activity
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Latest updates and events
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'auto', maxHeight: 450 }}>
        <List disablePadding>
          {data.map((activity, index) => (
            <ListItem
              key={activity.id}
              sx={{
                px: 0,
                py: 1.5,
                borderBottom: index < data.length - 1 ? 1 : 0,
                borderColor: 'divider',
                transition: 'background-color 0.2s',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.02)',
                },
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: `${getActivityColor(activity.type)}.main`,
                    width: 40,
                    height: 40,
                  }}
                >
                  {getActivityIcon(activity.type)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {activity.title}
                    </Typography>
                    {activity.status && (
                      <Chip
                        label={activity.status}
                        size="small"
                        color={activity.status as any}
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block', mb: 0.3 }}>
                      {activity.description}
                    </Typography>
                    <Typography component="span" variant="caption" color="text.secondary" fontWeight={500}>
                      {activity.timestamp}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

export default RecentActivity;
