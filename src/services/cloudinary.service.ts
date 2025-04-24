import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import { AppError } from '../middleware/errorHandler.middlerware';
import { env } from '../config/env';
import path from 'path';

// Configure Cloudinary
// The CLOUDINARY_URL should be in format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
const cloudinaryUrl = env.cloudinaryUrl || process.env.CLOUDINARY_URL;

if (!cloudinaryUrl) {
  console.warn('CLOUDINARY_URL is not set. File uploads will not work correctly.');
}

// Configure Cloudinary from environment variable
cloudinary.config({
  secure: true
});

// Create storage engine for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'secure-express-api',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  } as any
});

// Create multer upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const filetypes = /jpeg|jpg|png|gif|svg|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Function to upload single image
const uploadSingleImage = (fieldName: string) => upload.single(fieldName);

// Function to upload multiple images
const uploadMultipleImages = (fieldName: string, maxCount: number = 5) => 
  upload.array(fieldName, maxCount);

// Delete image from Cloudinary
const deleteImage = async (publicId: string): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    throw AppError.database('Failed to delete image from Cloudinary', error);
  }
};

// Get public ID from Cloudinary URL
const getPublicIdFromUrl = (url: string): string => {
  if (!url) return '';
  
  // Extract the public ID from the URL
  // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}.{extension}
  const urlParts = url.split('/');
  const publicIdWithExtension = urlParts[urlParts.length - 1];
  const publicId = publicIdWithExtension.split('.')[0];
  
  return publicId;
};

export default {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage,
  getPublicIdFromUrl
};