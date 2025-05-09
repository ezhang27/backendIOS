import { Request, Response, NextFunction } from 'express';
import environment from '../config/environment';

/**
 * Custom error classes for better error handling
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  errors: any[];
  
  constructor(message: string, errors: any[]) {
    super(message, 400);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string = 'Database error occurred') {
    super(message, 500);
    this.name = 'DatabaseError';
  }
}

// Async handler to catch errors in async routes
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Not found error handler - called when no route matches
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

// Main error handler for the application
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);
  
  // Define status code (default to 500 if not an ApiError)
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  
  // Standard error response format
  const errorResponse: any = {
    error: {
      message: err.message || 'An unexpected error occurred',
      type: err.name || 'Error'
    }
  };
  
  // Add validation errors if present
  if (err instanceof ValidationError) {
    errorResponse.error.details = err.errors;
  }
  
  // Add stack trace in development mode
  if (environment.isDevelopment) {
    errorResponse.error.stack = err.stack;
  }
  
  // Set response
  res.status(statusCode).json(errorResponse);
}; 