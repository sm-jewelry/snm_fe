import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
} from '@mui/material';

interface RefundDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (amount: number, reason: string) => Promise<void>;
  orderTotal: number;
  orderId: string;
}

/**
 * RefundDialog
 * Modal for processing order refunds
 * Validates refund amount and requires reason
 */
const RefundDialog: React.FC<RefundDialogProps> = ({
  open,
  onClose,
  onConfirm,
  orderTotal,
  orderId,
}) => {
  const [amount, setAmount] = useState(orderTotal.toString());
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    const refundAmount = parseFloat(amount);

    // Validation
    if (isNaN(refundAmount) || refundAmount <= 0) {
      setError('Please enter a valid refund amount');
      return;
    }

    if (refundAmount > orderTotal) {
      setError('Refund amount cannot exceed order total');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason for the refund');
      return;
    }

    try {
      setLoading(true);
      await onConfirm(refundAmount, reason);
      // Reset form
      setAmount(orderTotal.toString());
      setReason('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process refund');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setAmount(orderTotal.toString());
      setReason('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Process Refund</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Order ID: <strong>#{orderId}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Order Total: <strong>₹{orderTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Refund Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            required
            sx={{ mt: 3 }}
            InputProps={{
              startAdornment: '₹',
            }}
            inputProps={{
              min: 0,
              max: orderTotal,
              step: 0.01,
            }}
            helperText={`Maximum: ₹${orderTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          />

          <TextField
            label="Reason for Refund"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
            required
            multiline
            rows={3}
            sx={{ mt: 2 }}
            placeholder="E.g., Customer requested cancellation, Product damaged, etc."
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="error"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Process Refund'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RefundDialog;
