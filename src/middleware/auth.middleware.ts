import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { sendError } from '../utils/responseHandler';
import { UserRole } from '../types/user.types';

/**
 * Authenticate user middleware
*/
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return sendError(res, 'Authentication token is required', 401);
    }

    // Verify token
    const decoded = verifyToken(token);

    // Set user info in the request
    (req as any).user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return sendError(res, 'Invalid or expired token', 401);
  }
};

/**
 * Check if user has admin role
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!(req as any).user) {
    return sendError(res, 'Authentication required', 401);
  }

  if ((req as any).user.role !== UserRole.ADMIN) {
    return sendError(res, 'Unauthorized: Admin role required', 403);
  }

  next();
};

/**
 * Check if user is accessing their own resource or is an admin
 */
export const isOwnerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!(req as any).user) {
    return sendError(res, 'Authentication required', 401);
  }

  // Allow if user is admin
  if ((req as any).user.role === UserRole.ADMIN) {
    return next();
  }

  // Check if user is accessing their own resource
  const resourceId = req.params.id || req.body.userId;
  if (resourceId && resourceId === (req as any).user.id) {
    return next();
  }

  return sendError(res, 'Unauthorized: You do not have permission to access this resource', 403);
};