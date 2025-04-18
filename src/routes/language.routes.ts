import express from 'express';
import { LanguageController } from '../controllers/language.controller';

const router = express.Router();
const languageController = new LanguageController();

// Routes
router.post('/', languageController.createLanguage);
router.get('/', languageController.getAllLanguages);
router.get('/:id', languageController.getLanguageById);
router.put('/:id', languageController.updateLanguage);
router.delete('/:id', languageController.deleteLanguage);

export default router;