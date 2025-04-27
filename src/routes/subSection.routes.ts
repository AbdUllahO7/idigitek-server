import express from 'express';
import SubSectionController from '../controllers/subSection.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Base routes for subsections
router.post('/', authenticate, SubSectionController.createSubSection);
router.get('/', SubSectionController.getAllSubSections);

// Route for getting subsection by slug - must come before /:id route to avoid conflicts
router.get('/slug/:slug', SubSectionController.getSubSectionBySlug);
router.get('/slug/:slug/complete', SubSectionController.getCompleteSubSectionBySlug);

// Route for updating order of multiple subsections
router.put('/order', authenticate, SubSectionController.updateSubsectionsOrder);

// Get subsections by section item
router.get('/sectionItem/:sectionItemId', SubSectionController.getSubSectionsBySectionItemId);

// Individual subsection routes
router.get('/:id', SubSectionController.getSubSectionById);
router.get('/:id/complete', SubSectionController.getCompleteSubSectionById);
router.put('/:id', authenticate, SubSectionController.updateSubSection);
router.delete('/:id', authenticate, SubSectionController.deleteSubSection);

export default router;