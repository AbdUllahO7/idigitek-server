import express from 'express';
import SectionElementController from '../controllers/sectionElement.controller';

const router = express.Router();

// Base routes for section elements
router.post('/', SectionElementController.createSectionElement);
router.get('/', SectionElementController.getAllSectionElements);
router.get('/:id', SectionElementController.getSectionElementById);
router.put('/:id', SectionElementController.updateSectionElement);
router.delete('/:id', SectionElementController.deleteSectionElement);

// Parent relationship routes
router.get('/:id/parents', SectionElementController.getElementParents);

// Direct relationship management
router.post('/relations', SectionElementController.createElementRelation);

export default router;