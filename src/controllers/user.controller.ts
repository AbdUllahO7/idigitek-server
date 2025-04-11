import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendPaginatedSuccess } from '../utils/responseHandler';
import { UserRole, UserStatus } from '../types/user.types';
import { AppError } from '../middleware/errorHandler.middlerware';
import * as userService from '../services/user.service';

/**
 * Get current user profile
 */
export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      throw new AppError('User ID is required', 400);
    }
    
    const user = await userService.getCurrentUser(req.user.id);
    return sendSuccess(res, user, 'User profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      throw new AppError('User ID is required', 400);
    }
    
    const updateData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    };
    
    const updatedUser = await userService.updateProfile(req.user.id, updateData);
    return sendSuccess(res, updatedUser, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID (admin only)
 */
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return sendSuccess(res, user, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users with pagination and filtering (admin only)
 */
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const options = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      status: req.query.status as UserStatus | undefined,
      role: req.query.role as UserRole | undefined,
      search: req.query.search as string | undefined,
      sortBy: req.query.sortBy as string | undefined,
      sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
    };
    
    const result = await userService.getUsers(options);
    
    return sendPaginatedSuccess(
      res,
      result.users,
      result.pagination,
      'Users retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedUser = await userService.updateUserRole(
      req.params.id,
      req.body.role as UserRole
    );
    
    return sendSuccess(res, updatedUser, 'User role updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update user status (admin only)
 */
export const updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedUser = await userService.updateUserStatus(
      req.params.id,
      req.body.status as UserStatus
    );
    
    return sendSuccess(res, updatedUser, 'User status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user (admin only)
 */
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.deleteUser(req.params.id);
    return sendSuccess(res, result, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};