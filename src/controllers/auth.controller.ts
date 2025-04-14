import { Request, Response } from 'express';
import { sendSuccess } from '../utils/responseHandler';
import * as authService from '../services/auth.service';
import { AppError, asyncHandler } from 'src/middleware/errorHandler.middlerware';

/**
 * Register a new user
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  
  // Don't return verification token in production
  if (process.env.NODE_ENV === 'production') {
    // Create a new object without the verificationToken instead of using delete
    const { verificationToken, ...safeResult } = result;
    return sendSuccess(res, safeResult, 'User registered successfully', 201);
  }
  
  return sendSuccess(res, result, 'User registered successfully', 201);
});

/**
 * Login user
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  return sendSuccess(res, result, 'User logged in successfully');
});

/**
 * Logout user
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw AppError.badRequest('User ID is required');
  }
  
  const result = await authService.logout(req.user.id);
  return sendSuccess(res, result, 'User logged out successfully');
});

/**
 * Refresh access token
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    throw AppError.badRequest('Refresh token is required');
  }
  
  const result = await authService.refreshToken(refreshToken);
  return sendSuccess(res, result, 'Token refreshed successfully');
});

/**
 * Request password reset
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  
  if (!email) {
    throw AppError.badRequest('Email is required');
  }
  
  const result = await authService.forgotPassword(email);
  
  // Don't return reset token in production
  if (process.env.NODE_ENV === 'production') {
    // Create a new object without the resetToken instead of using delete
    const { resetToken, ...safeResult } = result;
    return sendSuccess(res, safeResult, 'Password reset request processed');
  }
  
  return sendSuccess(res, result, 'Password reset request processed');
});

/**
 * Reset password with token
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    throw AppError.badRequest('Token and new password are required');
  }
  
  const result = await authService.resetPassword(token, newPassword);
  return sendSuccess(res, result, 'Password reset successfully');
});

/**
 * Change user password
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw AppError.badRequest('User ID is required');
  }
  
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    throw AppError.badRequest('Current password and new password are required');
  }
  
  const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
  return sendSuccess(res, result, 'Password changed successfully');
});

/**
 * Verify email with token
 */
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;
  
  if (!token) {
    throw AppError.badRequest('Verification token is required');
  }
  
  const result = await authService.verifyEmail(token);
  return sendSuccess(res, result, 'Email verified successfully');
});

/**
 * Resend verification email
 */
export const resendVerificationEmail = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw AppError.badRequest('User ID is required');
  }
  
  const result = await authService.resendVerificationEmail(req.user.id);
  
  // Don't return verification token in production
  if (process.env.NODE_ENV === 'production') {
    // Create a new object without the verificationToken instead of using delete
    const { verificationToken, ...safeResult } = result;
    return sendSuccess(res, safeResult, 'Verification email sent successfully');
  }
  
  return sendSuccess(res, result, 'Verification email sent successfully');
});