import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import uploadController from '../controllers/upload.controller';
import cloudinaryService from '../services/cloudinary.service';
import { handleMulterError } from '../middleware/multer.Error.middleware';

const router = express.Router();

/**
 * @route   POST /api/uploads/image
 * @desc    Upload a single image
 * @access  Private
 */
router.post(
  '/image',
  authenticate,
  cloudinaryService.uploadSingleImage('image'),
  handleMulterError,
  uploadController.uploadImage
);

/**
 * @route   POST /api/uploads/images
 * @desc    Upload multiple images (up to 5)
 * @access  Private
 */
router.post(
  '/images',
  authenticate,
  cloudinaryService.uploadMultipleImages('images', 5),
  uploadController.uploadImages
);

/**
 * @route   DELETE /api/uploads/image/:publicId
 * @desc    Delete an image from Cloudinary
 * @access  Private/Admin
 */
router.delete(
  '/image/:publicId',
  authenticate,
  isAdmin,
  uploadController.deleteImage
);

export default router;