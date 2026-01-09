/**
 * Custom API Error Classes
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Too many requests. Please try again later.') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized. Please login again.') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Access denied. Insufficient permissions.') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found.') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string = 'Validation failed.', public errors?: any) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class ServerError extends ApiError {
  constructor(message: string = 'Server error. Please try again later.') {
    super(message, 500, 'SERVER_ERROR');
    this.name = 'ServerError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network error. Please check your connection.') {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Factory function to create appropriate error based on response
 */
export function createApiError(statusCode: number, message: string, data?: any): ApiError {
  switch (statusCode) {
    case 400:
      return new ValidationError(message, data?.errors);
    case 401:
      return new UnauthorizedError(message);
    case 403:
      return new ForbiddenError(message);
    case 404:
      return new NotFoundError(message);
    case 429:
      return new RateLimitError(message);
    case 500:
    case 502:
    case 503:
    case 504:
      return new ServerError(message);
    default:
      return new ApiError(message, statusCode);
  }
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof RateLimitError) {
    return 'You\'ve made too many requests. Please wait a moment and try again.';
  }

  if (error instanceof UnauthorizedError) {
    return 'Your session has expired. Please login again.';
  }

  if (error instanceof ForbiddenError) {
    return 'You don\'t have permission to perform this action.';
  }

  if (error instanceof NotFoundError) {
    return 'The requested resource was not found.';
  }

  if (error instanceof ValidationError) {
    return error.message || 'Please check your input and try again.';
  }

  if (error instanceof ServerError) {
    return 'Something went wrong on our end. Please try again later.';
  }

  if (error instanceof NetworkError) {
    return 'Network connection issue. Please check your internet connection.';
  }

  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof RateLimitError) return true;
  if (error instanceof ServerError) return true;
  if (error instanceof NetworkError) return true;
  if (error instanceof ApiError && error.statusCode >= 500) return true;
  return false;
}
