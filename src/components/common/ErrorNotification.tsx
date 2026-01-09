import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Snackbar, Alert, AlertTitle, Button, Box } from '@mui/material';
import { getUserFriendlyErrorMessage, isRetryableError } from '../../lib/errors';

interface ErrorNotificationContextType {
  showError: (error: unknown, retryAction?: () => void) => void;
  hideError: () => void;
}

const ErrorNotificationContext = createContext<ErrorNotificationContextType | undefined>(undefined);

export function useErrorNotification() {
  const context = useContext(ErrorNotificationContext);
  if (!context) {
    throw new Error('useErrorNotification must be used within ErrorNotificationProvider');
  }
  return context;
}

interface ErrorNotificationProviderProps {
  children: ReactNode;
}

export function ErrorNotificationProvider({ children }: ErrorNotificationProviderProps) {
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryAction, setRetryAction] = useState<(() => void) | undefined>(undefined);
  const [canRetry, setCanRetry] = useState(false);

  const showError = useCallback((error: unknown, retry?: () => void) => {
    const message = getUserFriendlyErrorMessage(error);
    setErrorMessage(message);
    setRetryAction(() => retry);
    setCanRetry(isRetryableError(error) && !!retry);
    setOpen(true);
  }, []);

  const hideError = useCallback(() => {
    setOpen(false);
    setRetryAction(undefined);
    setCanRetry(false);
  }, []);

  const handleRetry = () => {
    hideError();
    if (retryAction) {
      retryAction();
    }
  };

  return (
    <ErrorNotificationContext.Provider value={{ showError, hideError }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={canRetry ? null : 6000}
        onClose={hideError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 8 }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={hideError}
          sx={{ width: '100%', maxWidth: 600 }}
          action={
            canRetry ? (
              <Button color="inherit" size="small" onClick={handleRetry}>
                Retry
              </Button>
            ) : null
          }
        >
          <AlertTitle>Error</AlertTitle>
          {errorMessage}
        </Alert>
      </Snackbar>
    </ErrorNotificationContext.Provider>
  );
}
