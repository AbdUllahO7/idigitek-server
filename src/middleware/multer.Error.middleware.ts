import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.middlerware';
import multer from 'multer';

/**
 * Middleware to handle multer errors
 */
export const handleMulterError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    let message = 'File upload error';
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File size exceeds the limit (5MB)';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files uploaded';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = `Unexpected field: ${error.field}`;
        break;
      default:
        message = error.message;
    }
    
    return next(AppError.badRequest(message));
  } else if (error) {
    // Other errors
    return next(AppError.badRequest(error.message || 'File upload failed'));
  }
  
  next();
};