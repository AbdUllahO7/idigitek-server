import express from 'express';
import subSectionController from '../controllers/subSection.controller';

const router = express.Router();

// Base routes for subsections
router.post('/', subSectionController.createSubSection);
router.get('/', subSectionController.getAllSubSections);
router.get('/:id', subSectionController.getSubSectionById);
router.put('/:id', subSectionController.updateSubSection);
router.delete('/:id', subSectionController.deleteSubSection);

// Element relationship routes
router.get('/:id/elements', subSectionController.getSubSectionElements);
router.post('/:id/elements', subSectionController.addElementToSubSection);
router.delete('/:id/elements/:elementId', subSectionController.removeElementFromSubSection);

export default router;