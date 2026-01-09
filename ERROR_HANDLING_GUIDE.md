# Error Handling System - Usage Guide

## Overview

The application now has a comprehensive error handling system that handles different types of API errors including:

- ✅ **Rate Limiting (429)** - "Too many requests"
- ✅ **Authentication (401)** - Session expired
- ✅ **Authorization (403)** - Access denied
- ✅ **Not Found (404)** - Resource not found
- ✅ **Validation (400)** - Invalid input
- ✅ **Server Errors (500+)** - Server-side issues
- ✅ **Network Errors** - Connection issues

## Architecture

### 1. Custom Error Classes (`src/lib/errors.ts`)

All API errors are now typed and categorized:

```typescript
- ApiError - Base error class
- RateLimitError - HTTP 429
- UnauthorizedError - HTTP 401
- ForbiddenError - HTTP 403
- NotFoundError - HTTP 404
- ValidationError - HTTP 400
- ServerError - HTTP 500+
- NetworkError - Network connection issues
```

### 2. Enhanced API Client (`src/lib/apiClient.ts`)

The API client automatically:
- Converts HTTP errors into typed error classes
- Handles network failures
- Provides detailed error messages

### 3. Global Error Notification (`src/components/common/ErrorNotification.tsx`)

Provider component that displays user-friendly error messages at the top center of the screen with:
- Automatic dismiss after 6 seconds (for non-retryable errors)
- Manual dismiss button
- Retry button for retryable errors (rate limiting, server errors, network errors)

### 4. Error Boundary (`src/components/common/ErrorBoundary.tsx`)

Catches React component errors and displays a fallback UI with:
- User-friendly error message
- "Try Again" button to reset the error state
- "Go Home" button to navigate to homepage
- Developer-friendly error details in development mode

## Setup (Already Done in `_app.tsx`)

```typescript
import { ErrorBoundary } from "../components/common/ErrorBoundary";
import { ErrorNotificationProvider } from "../components/common/ErrorNotification";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <ErrorNotificationProvider>
        {/* Your app content */}
      </ErrorNotificationProvider>
    </ErrorBoundary>
  );
}
```

## Usage in Components

### Option 1: Using the `useErrorNotification` Hook (Recommended)

```typescript
import { useErrorNotification } from '../components/common/ErrorNotification';
import { apiClient } from '../lib/apiClient';

function MyComponent() {
  const { showError } = useErrorNotification();

  const fetchData = async () => {
    try {
      const data = await apiClient.getMyOrders();
      // Handle success
    } catch (error) {
      // This will show a user-friendly error notification
      showError(error, fetchData); // Pass fetchData as retry action
    }
  };

  return (
    <button onClick={fetchData}>Load Data</button>
  );
}
```

### Option 2: Manual Error Handling

```typescript
import { getUserFriendlyErrorMessage, isRetryableError } from '../lib/errors';

function MyComponent() {
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const data = await apiClient.getProducts();
      // Handle success
    } catch (err) {
      const message = getUserFriendlyErrorMessage(err);
      setError(message);

      // Check if error is retryable
      if (isRetryableError(err)) {
        console.log('You can retry this operation');
      }
    }
  };
}
```

## Error Messages by Type

### Rate Limit Error (429)
```
User sees: "You've made too many requests. Please wait a moment and try again."
With: Retry button (persistent notification)
```

### Unauthorized Error (401)
```
User sees: "Your session has expired. Please login again."
Auto-redirects to login page
```

### Forbidden Error (403)
```
User sees: "You don't have permission to perform this action."
```

### Not Found Error (404)
```
User sees: "The requested resource was not found."
```

### Validation Error (400)
```
User sees: The actual validation message from the API
Example: "Email is required"
```

### Server Error (500+)
```
User sees: "Something went wrong on our end. Please try again later."
With: Retry button
```

### Network Error
```
User sees: "Network connection issue. Please check your internet connection."
With: Retry button
```

## Example: Updating Profile Page

### Before:
```typescript
const fetchOrders = async () => {
  try {
    const response = await apiClient.getMyOrders();
    setOrders(response.data || []);
  } catch (error) {
    console.error('Failed to fetch orders:', error); // Only logs to console
  }
};
```

### After:
```typescript
import { useErrorNotification } from '../components/common/ErrorNotification';

function ProfileContent() {
  const { showError } = useErrorNotification();

  const fetchOrders = async () => {
    try {
      const response = await apiClient.getMyOrders();
      setOrders(response.data || []);
    } catch (error) {
      // Now shows user-friendly notification with retry option
      showError(error, fetchOrders);
    }
  };
}
```

## Testing Error Scenarios

### Test Rate Limiting
Make rapid API calls to trigger rate limiting:
```typescript
// This will trigger rate limiting after several requests
for (let i = 0; i < 100; i++) {
  await apiClient.getProducts();
}
```

### Test Network Error
Disconnect internet or set wrong API URL:
```typescript
// Will show network error notification
await apiClient.getProducts();
```

### Test Unauthorized
Use expired token or clear tokens:
```typescript
localStorage.removeItem('access_token');
await apiClient.getMyOrders(); // Will show "Session expired"
```

## Benefits

1. **Consistent Error Handling**: All API errors are handled uniformly
2. **User-Friendly Messages**: Technical errors converted to readable messages
3. **Retry Mechanism**: Automatic retry option for recoverable errors
4. **Better UX**: Clear feedback when something goes wrong
5. **Developer-Friendly**: Detailed error info in development mode
6. **Type Safety**: All errors are properly typed
7. **Centralized Logic**: Error handling logic in one place

## Next Steps

1. ✅ Error handling system is set up globally
2. 🔄 Update individual components to use `useErrorNotification` hook
3. 🔄 Test all error scenarios
4. 🔄 Add error logging service integration (optional)
5. 🔄 Add analytics for error tracking (optional)

## API Gateway Rate Limiting Configuration

If you need to adjust rate limits, check your API Gateway configuration. Common settings:
- `windowMs`: Time window in milliseconds (e.g., 15 * 60 * 1000 = 15 minutes)
- `max`: Maximum requests per window
- `message`: Custom error message

Example:
```javascript
// In API Gateway
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
```
