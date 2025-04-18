// routes/subSectionRoutes.ts
import express from 'express';
import { SubSectionController } from '../controllers/subSection.controller';

const router = express.Router();
const subSectionController = new SubSectionController();

// Routes
router.post('/', subSectionController.createSubSection);
router.get('/', subSectionController.getAllSubSections);
router.get('/:id', subSectionController.getSubSectionById);
router.get('/:id/content', subSectionController.getSubSectionWithContent);
router.put('/:id', subSectionController.updateSubSection);
router.delete('/:id', subSectionController.deleteSubSection);

export default router;