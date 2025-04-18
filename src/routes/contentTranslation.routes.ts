// routes/contentTranslationRoutes.ts
import express from 'express';
import { ContentTranslationController } from '../controllers/ContentTranslation.controller';

const router = express.Router();
const contentTranslationController = new ContentTranslationController();

// Routes
router.post('/', contentTranslationController.createOrUpdateTranslation);
router.post('/bulk', contentTranslationController.bulkCreateOrUpdateTranslations);
router.get('/', contentTranslationController.getTranslation);
router.get('/element/:elementId', contentTranslationController.getAllTranslationsForElement);
router.delete('/:id', contentTranslationController.deleteTranslation);

export default router;