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
 * Create a new user (superAdmin only)
 */
  createUser = asyncHandler(async (req: Request, res: Response) => {
    const userData = {
      email: req.body.email,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      role: req.body.role as UserRole | undefined,
      status: req.body.status as UserStatus | undefined,
    };
    
    // Check if trying to create a superAdmin
    if (userData.role === UserRole.SUPER_ADMIN || userData.role === UserRole.OWNER) {
      // Check if a superAdmin already exists
      const existingSuperAdmin = await userService.checkSuperAdminsExists();
      if (existingSuperAdmin) {
        throw AppError.validation('A SuperAdmin user already exists in the system');
      }
    }
    
    const newUser = await userService.createUser(userData);
    return sendSuccess(res, newUser, 'User created successfully', 201);
  });



  /**
   * Update any user (OWNER AND SUPER ADMIN )
   */
  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;
    
    // Get all update fields from request body
    const updateData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      role: req.body.role as UserRole,
      status: req.body.status as UserStatus,
      password: req.body.password,
    };
    
    // Filter out undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    
    // Check if trying to update to superAdmin
    if (updateData.role === UserRole.SUPER_ADMIN || updateData.role === UserRole.OWNER) {
      // Check if a superAdmin already exists
      const existingSuperAdmins = await userService.checkSuperAdminsExists();
      if (existingSuperAdmins) {
        // Check if this user is already the superAdmin (in which case, we'll allow the update)
        const currentUser = await userService.getUserById(userId);
        if (currentUser.role !== UserRole.OWNER) {
          throw AppError.validation('A OWNER user already exists in the system');
        }
      }
    }
    
    const updatedUser = await userService.updateUser(userId, updateData);
    return sendSuccess(res, updatedUser, 'User updated successfully');
  });
  



  /**
   * Update user profile
   */
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
      throw AppError.badRequest('User ID is required');
    }
    
    // Get all update fields from request body
    const updateData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
    };
    
    // Filter out undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    
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
  const newRole = req.body.role as UserRole;
  
  // Check if trying to update to superAdmin
  if (newRole === UserRole.SUPER_ADMIN || newRole === UserRole.OWNER) {
    // Check if a superAdmin already exists
    const existingSuperAdmin = await userService.checkSuperAdminsExists();
    if (existingSuperAdmin) {
      // Check if this user is already the superAdmin (in which case, we'll allow the update)
      const currentUser = await userService.getUserById(req.params.id);
      if (currentUser.role !== UserRole.SUPER_ADMIN && currentUser.role !== UserRole.OWNER) {
        throw AppError.validation('A SuperAdmin user already exists in the system');
      }
    }
  }
  
  const updatedUser = await userService.updateUserRole(
    req.params.id,
    newRole
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