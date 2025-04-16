// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { sendSuccess, sendPaginatedSuccess } from '../utils/responseHandler';
import { UserRole, UserStatus } from '../types/user.types';
import { AppError, asyncHandler } from '../middleware/errorHandler.middlerware';
import userService from '../services/user.service';

/**
 * User Controller
 * Handles all user-related requests
 */
class UserController {
  /**
   * Get current user profile
   */
  getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
      throw AppError.badRequest('User ID is required');
    }
    
    const user = await userService.getCurrentUser(req.user.id);
    console.log(user)
    return sendSuccess(res, user, 'User profile retrieved successfully');
  });

  /**
   * Update user profile
   */
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
      throw AppError.badRequest('User ID is required');
    }
    
    const updateData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    };
    
    const updatedUser = await userService.updateProfile(req.user.id, updateData);
    return sendSuccess(res, updatedUser, 'Profile updated successfully');
  });

  /**
   * Get user by ID (admin only)
   */
  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getUserById(req.params.id);
    return sendSuccess(res, user, 'User retrieved successfully');
  });

  /**
   * Get all users with pagination and filtering (admin only)
   */
  getUsers = asyncHandler(async (req: Request, res: Response) => {
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
  });

  /**
   * Update user role (admin only)
   */
  updateUserRole = asyncHandler(async (req: Request, res: Response) => {
    const updatedUser = await userService.updateUserRole(
      req.params.id,
      req.body.role as UserRole
    );
    
    return sendSuccess(res, updatedUser, 'User role updated successfully');
  });

  /**
   * Update user status (admin only)
   */
  updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
    const updatedUser = await userService.updateUserStatus(
      req.params.id,
      req.body.status as UserStatus
    );
    
    return sendSuccess(res, updatedUser, 'User status updated successfully');
  });

  /**
   * Delete user (admin only)
   */
  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    // First check if this is the user trying to delete themselves
    if (req.user?.id === req.params.id) {
      throw AppError.badRequest('You cannot delete your own account');
    }
    
    // Check for last user before deleting
    const userCount = await userService.getUserCount();
    if (userCount <= 1) {
      throw AppError.badRequest('Cannot delete the last user in the system');
    }
    
    const result = await userService.deleteUser(req.params.id);
    return sendSuccess(res, result, 'User deleted successfully');
  });
}

export default new UserController();