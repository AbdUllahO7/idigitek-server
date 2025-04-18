
// routes/sectionRoutes.ts
import express from 'express';
import { SectionController } from '../controllers/section.controller';

const router = express.Router();
const sectionController = new SectionController();

// Routes
router.post('/', sectionController.createSection);
router.get('/', sectionController.getAllSections);
router.get('/:id', sectionController.getSectionById);
router.get('/:id/content', sectionController.getSectionWithContent);
router.put('/:id', sectionController.updateSection);
router.delete('/:id', sectionController.deleteSection);

export default router;