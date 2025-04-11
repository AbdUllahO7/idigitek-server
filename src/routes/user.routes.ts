import express from 'express';
import * as userController from '../controllers/user.controller';
import { validate } from '../middleware/validator.middleware';
import { authenticate, isAdmin, isOwnerOrAdmin } from '../middleware/auth.middleware';
import { getUserByIdValidator, getUsersValidator, updateProfileValidator, updateUserRoleValidator, updateUserStatusValidator } from '../validations/user.validation';


const router = express.Router();

/**
 * @route   GET /api/v1/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/me',
  authenticate,
  userController.getCurrentUser
);

/**
 * @route   PUT /api/v1/users/me
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/me',
  authenticate,
  validate(updateProfileValidator),
  userController.updateProfile
);

/**
 * @route   GET /api/v1/users
 * @desc    Get all users with pagination and filtering
 * @access  Admin
 */
router.get(
  '/',
  authenticate,
  isAdmin,
  validate(getUsersValidator),
  userController.getUsers
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Admin or Owner
 */
router.get(
  '/:id',
  authenticate,
  isOwnerOrAdmin,
  validate(getUserByIdValidator),
  userController.getUserById
);

/**
 * @route   PUT /api/v1/users/:id/role
 * @desc    Update user role
 * @access  Admin
 */
router.put(
  '/:id/role',
  authenticate,
  isAdmin,
  validate(updateUserRoleValidator),
  userController.updateUserRole
);

/**
 * @route   PUT /api/v1/users/:id/status
 * @desc    Update user status
 * @access  Admin
 */
router.put(
  '/:id/status',
  authenticate,
  isAdmin,
  validate(updateUserStatusValidator),
  userController.updateUserStatus
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user
 * @access  Admin
 */
router.delete(
  '/:id',
  authenticate,
  isAdmin,
  validate(getUserByIdValidator),
  userController.deleteUser
);

export default router;