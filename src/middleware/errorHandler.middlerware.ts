import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { sendError } from '../utils/responseHandler';
import { env } from '../config/env';

/**
 * Custom error class
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default error values
  let statusCode = 500;
  let message = 'Something went wrong';
  let errorDetails = undefined;

  // Handle custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    
    // Log operational errors
    if (err.isOperational) {
      logger.error(`Operational error: ${err.message}`, {
        error: err.stack,
        path: req.path,
        method: req.method,
      });
    } else {
      // Critical error - log with higher priority
      logger.error(`Critical error: ${err.message}`, {
        error: err.stack,
        path: req.path,
        method: req.method,
      });
    }
  } else {
    // Handle MongoDB errors
    if (err.name === 'ValidationError') {
      statusCode = 400;
      message = 'Validation Error';
      errorDetails = err.message;
    } else if (err.name === 'CastError') {
      statusCode = 400;
      message = 'Invalid ID format';
    } else if ((err as any).code === 11000) {
      statusCode = 409;
      message = 'Duplicate key error';
      
      // Extract duplicate field info (for MongoDB duplicate key errors)
      const keyPattern = (err as any).keyPattern;
      if (keyPattern) {
        const field = Object.keys(keyPattern)[0];
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
      }
    } else {
      // Unknown error - log it for debugging
      logger.error(`Unhandled error: ${err.message}`, {
        error: err.stack,
        path: req.path,
        method: req.method,
      });
    }
  }

  // In development, include error stack in response
  if (env.nodeEnv === 'development') {
    errorDetails = errorDetails || err.stack;
  }

  // Send error response
  return sendError(res, message, statusCode, errorDetails);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
  return sendError(res, `Cannot ${req.method} ${req.originalUrl}`, 404);
};