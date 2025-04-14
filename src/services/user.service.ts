import { AppError } from '../middleware/errorHandler.middlerware';
import UserModel from '../models/user.model';
import {IUserWithoutPassword, UserRole, UserStatus } from '../types/user.types';
import { createPaginationMeta } from '../utils/responseHandler';
import mongoose from 'mongoose';

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<IUserWithoutPassword> => {
  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw AppError.validation('Invalid ID format');
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw AppError.notFound('User not found', { userId });
  }

  // Return user without password
  return {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    status: user.status,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (userId: string): Promise<IUserWithoutPassword> => {
  return getUserById(userId);
};

/**
 * Update user profile
 */
export const updateProfile = async (
  userId: string,
  updateData: {
    firstName?: string;
    lastName?: string;
  }
): Promise<IUserWithoutPassword> => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw AppError.notFound('User not found', { userId });
  }

  // Validate data
  if (updateData.firstName && (updateData.firstName.length < 2 || updateData.firstName.length > 50)) {
    throw AppError.validation('First name must be between 2 and 50 characters');
  }
  
  if (updateData.lastName && (updateData.lastName.length < 2 || updateData.lastName.length > 50)) {
    throw AppError.validation('Last name must be between 2 and 50 characters');
  }

  // Update fields if provided
  if (updateData.firstName) {
    user.firstName = updateData.firstName;
  }
  if (updateData.lastName) {
    user.lastName = updateData.lastName;
  }

  try {
    await user.save();
  } catch (error) {
    throw AppError.database('Failed to update user', { error: error.message });
  }

  // Return updated user without password
  return {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    status: user.status,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * Get all users with pagination and filtering (admin only)
 */
export const getUsers = async (options: {
  page?: number;
  limit?: number;
  status?: UserStatus;
  role?: UserRole;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  // Build filter
  const filter: any = {};
  
  if (options.status) {
    filter.status = options.status;
  }
  
  if (options.role) {
    filter.role = options.role;
  }
  
  if (options.search) {
    filter.$or = [
      { email: { $regex: options.search, $options: 'i' } },
      { firstName: { $regex: options.search, $options: 'i' } },
      { lastName: { $regex: options.search, $options: 'i' } },
    ];
  }

  // Build sort options
  const sortOptions: any = {};
  if (options.sortBy) {
    // Validate allowed sort fields
    const allowedSortFields = ['createdAt', 'email', 'firstName', 'lastName', 'role', 'status'];
    if (!allowedSortFields.includes(options.sortBy)) {
      throw AppError.validation('Invalid sort field');
    }
    sortOptions[options.sortBy] = options.sortOrder === 'desc' ? -1 : 1;
  } else {
    sortOptions.createdAt = -1; // Default sort by creation date desc
  }

  try {
    // Count total matching documents
    const total = await UserModel.countDocuments(filter);

    // Get users with pagination
    const users = await UserModel.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .select('-password -refreshToken -emailVerificationToken -passwordResetToken');

    // Format users
    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    // Create pagination metadata
    const pagination = createPaginationMeta(total, limit, page);

    return {
      users: formattedUsers,
      pagination,
    };
  } catch (error) {
    throw AppError.database('Failed to retrieve users', { error: error.message });
  }
};

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (userId: string, role: UserRole): Promise<IUserWithoutPassword> => {
  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw AppError.validation('Invalid ID format');
  }

  // Validate role
  if (!Object.values(UserRole).includes(role)) {
    throw AppError.validation(`Role must be one of: ${Object.values(UserRole).join(', ')}`);
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw AppError.notFound('User not found', { userId });
  }

  user.role = role;
  
  try {
    await user.save();
  } catch (error) {
    throw AppError.database('Failed to update user role', { error: error.message });
  }

  // Return updated user without password
  return {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    status: user.status,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * Update user status (admin only)
 */
export const updateUserStatus = async (userId: string, status: UserStatus): Promise<IUserWithoutPassword> => {
  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw AppError.validation('Invalid ID format');
  }

  // Validate status
  if (!Object.values(UserStatus).includes(status)) {
    throw AppError.validation(`Status must be one of: ${Object.values(UserStatus).join(', ')}`);
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw AppError.notFound('User not found', { userId });
  }

  user.status = status;
  
  try {
    await user.save();
  } catch (error) {
    throw AppError.database('Failed to update user status', { error: error.message });
  }

  // Return updated user without password
  return {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    status: user.status,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * Delete user (admin only)
 */
export const deleteUser = async (userId: string): Promise<{ message: string }> => {
  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw AppError.validation('Invalid ID format');
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw AppError.notFound('User not found', { userId });
  }

  try {
    await user.deleteOne();
    return { message: 'User deleted successfully' };
  } catch (error) {
    throw AppError.database('Failed to delete user', { error: error.message });
  }
};