import { Router } from 'express';
import { UserRole } from '../types/user.types';
import { UserSectionController } from '../controllers/UserSection.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const userSectionController = new UserSectionController();

// Route to get all active sections for a user
router.get(
  '/:userId',
  authenticate,
  userSectionController.getUserSections
);

// Route to activate a section for a user
router.post(
  '/:userId/:sectionId/activate',
  authenticate,
  userSectionController.activateSection
);

// Route to deactivate a section for a user
router.post(
  '/:userId/:sectionId/deactivate',
  authenticate,
  userSectionController.deactivateSection
);

// Route to toggle a section status for a user
router.post(
  '/:userId/:sectionId/toggle',
  authenticate,
  userSectionController.toggleSection
);

// Route to get all users who have a specific section active (admin only)
router.get(
  '/section/:sectionId/users',
  authenticate,
  userSectionController.getUsersBySection
);

export default router;