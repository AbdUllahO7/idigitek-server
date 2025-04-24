// routes/sectionRoutes.ts
import express from 'express';
import { SectionController } from '../controllers/section.controller';
import { authenticate } from '../middleware/auth.middleware';
import cloudinaryService from '../services/cloudinary.service';
import { handleMulterError } from '../middleware/multer.Error.middleware';

const router = express.Router();
const sectionController = new SectionController();

// Routes
router.post('/', authenticate,sectionController.createSection);
router.get('/', sectionController.getAllSections);
router.get('/:id', sectionController.getSectionById);
router.get('/:id/content', sectionController.getSectionWithContent);

router.post(
  '/:id/image', 
  authenticate, 
  cloudinaryService.uploadSingleImage('image'),
  handleMulterError,
  sectionController.uploadSectionImage
);
router.patch('/:id', authenticate,sectionController.updateSection);
router.patch('/:id/status', authenticate, sectionController.updateSectionStatus); // New route for updating status
router.delete('/:id', authenticate, sectionController.deleteSection);

export default router;