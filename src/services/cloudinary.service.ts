// Create or update cloudinary.service.ts
import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../middleware/errorHandler.middlerware';

class CloudinaryService {
  constructor() {
    // Cloudinary is configured via environment variables (CLOUDINARY_URL)
    // This ensures cloudinary is properly initialized
    if (!process.env.CLOUDINARY_URL) {
      console.warn('Warning: CLOUDINARY_URL is not set. Image uploads may fail.');
    }
  }

  /**
   * Upload an image to Cloudinary
   * @param filePath Path to the image file
   * @returns Promise with the upload result
   */
  async uploadImage(filePath: string): Promise<any> {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: 'image',
        folder: 'content-elements',
      });
      return result;
    } catch (error) {
      throw AppError.badRequest('Failed to upload image to Cloudinary', error);
    }
  }

  /**
   * Delete an image from Cloudinary
   * @param publicId The public ID of the image
   * @returns Promise with the deletion result
   */
  async deleteImage(publicId: string): Promise<any> {
    try {
      return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw AppError.badRequest('Failed to delete image from Cloudinary', error);
    }
  }
}

export default new CloudinaryService();