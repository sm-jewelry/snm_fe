import React from 'react';
import { Stepper, Step, StepLabel, StepContent, Typography, Box } from '@mui/material';
import {
  HourglassEmpty as PendingIcon,
  Build as ProcessingIcon,
  LocalShipping as ShippedIcon,
  CheckCircle as DeliveredIcon,
  Cancel as CancelledIcon,
} from '@mui/icons-material';

interface OrderTimeline {
  status: string;
  timestamp: string;
  note?: string;
}

interface OrderStatusStepperProps {
  currentStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  timeline?: OrderTimeline[];
}

/**
 * OrderStatusStepper
 * Visual stepper showing order progress through workflow
 * Displays: Pending → Processing → Shipped → Delivered
 */
const OrderStatusStepper: React.FC<OrderStatusStepperProps> = ({ currentStatus, timeline = [] }) => {
  const steps = [
    { label: 'Order Placed', status: 'pending', icon: <PendingIcon /> },
    { label: 'Processing', status: 'processing', icon: <ProcessingIcon /> },
    { label: 'Shipped', status: 'shipped', icon: <ShippedIcon /> },
    { label: 'Delivered', status: 'delivered', icon: <DeliveredIcon /> },
  ];

  // Handle cancelled orders separately
  if (currentStatus === 'cancelled') {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CancelledIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
        <Typography variant="h6" color="error.main">
          Order Cancelled
        </Typography>
        {timeline.find((t) => t.status === 'cancelled')?.timestamp && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Cancelled on {new Date(timeline.find((t) => t.status === 'cancelled')!.timestamp).toLocaleString('en-IN')}
          </Typography>
        )}
        {timeline.find((t) => t.status === 'cancelled')?.note && (
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
            {timeline.find((t) => t.status === 'cancelled')?.note}
          </Typography>
        )}
      </Box>
    );
  }

  const activeStepIndex = steps.findIndex((step) => step.status === currentStatus);

  const getTimestampForStatus = (status: string) => {
    const timelineEntry = timeline.find((t) => t.status === status);
    return timelineEntry?.timestamp;
  };

  return (
    <Stepper activeStep={activeStepIndex} orientation="vertical">
      {steps.map((step, index) => {
        const timestamp = getTimestampForStatus(step.status);
        const isCompleted = index <= activeStepIndex;

        return (
          <Step key={step.status} completed={isCompleted && index !== activeStepIndex}>
            <StepLabel
              StepIconComponent={() => (
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isCompleted ? 'primary.main' : 'action.disabled',
                    color: 'white',
                  }}
                >
                  {step.icon}
                </Box>
              )}
            >
              <Typography variant="body1" fontWeight={isCompleted ? 600 : 400}>
                {step.label}
              </Typography>
            </StepLabel>
            <StepContent>
              {timestamp && (
                <Typography variant="body2" color="text.secondary">
                  {new Date(timestamp).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </Typography>
              )}
              {timeline.find((t) => t.status === step.status)?.note && (
                <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                  {timeline.find((t) => t.status === step.status)?.note}
                </Typography>
              )}
            </StepContent>
          </Step>
        );
      })}
    </Stepper>
  );
};

export default OrderStatusStepper;
