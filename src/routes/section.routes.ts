import express from 'express';
import SectionController from '../controllers/section.controller';

const router = express.Router();

// Base routes for sections
router.post('/', SectionController.createSection);
router.get('/', SectionController.getAllSections);
router.get('/:id', SectionController.getSectionById);
router.put('/:id', SectionController.updateSection);
router.delete('/:id', SectionController.deleteSection);
router.patch('/:id/status', SectionController.updateSectionStatus);

// Element relationship routes
router.get('/:id/elements', SectionController.getSectionElements);
router.post('/:id/elements', SectionController.addElementToSection);
router.delete('/:id/elements/:elementId', SectionController.removeElementFromSection);

export default router;