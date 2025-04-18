
// routes/contentElementRoutes.ts
import express from 'express';
import { ContentElementController } from '../controllers/ContentElement.controller';

const router = express.Router();
const contentElementController = new ContentElementController();

// Routes
router.post('/', contentElementController.createContentElement);
router.get('/', contentElementController.getAllContentElements);
router.get('/:id', contentElementController.getContentElementById);
router.get('/:id/translations', contentElementController.getContentElementWithTranslations);
router.put('/:id', contentElementController.updateContentElement);
router.delete('/:id', contentElementController.deleteContentElement);

export default router;