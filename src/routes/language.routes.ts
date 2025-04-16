import express, { Router } from 'express';
import LanguageController from '../controllers/language.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from 'src/middleware/section.middleware';


const router: Router = express.Router();

/**
 * @route   POST /api/languages
 * @desc    Create a new language
 * @access  Private/Admin
 */
router.post(
  '/',
  authenticate,
  LanguageController.createLanguage
);

/**
 * @route   GET /api/languages
 * @desc    Get all languages
 * @access  Public
 */
router.get(
  '/',
  LanguageController.getAllLanguages
);

/**
 * @route   GET /api/languages/code/:languageID
 * @desc    Get language by code (languageID)
 * @access  Public
 * Note: This route must be defined before the /:id route to avoid conflicts
 */
router.get(
    '/code/:languageID',
    LanguageController.getLanguageByCode
);

/**
 * @route   GET /api/languages/:id
 * @desc    Get language by ID
 * @access  Public
 */
router.get(
  '/:id',
  LanguageController.getLanguageById
);

/**
 * @route   PUT /api/languages/:id
 * @desc    Update language by ID
 * @access  Private/Admin
 */
router.put(
  '/:id',
  authenticate,
  LanguageController.updateLanguage
);
router.patch('/:id/status', LanguageController.updateLanguageStatus);



/**
 * @route   DELETE /api/languages/:id
 * @desc    Delete language by ID
 * @access  Private/Admin
 */
router.delete(
  '/:id',
  authenticate,
  LanguageController.deleteLanguage
);

/**
 * @route   POST /api/languages/:id/subsections
 * @desc    Add subSection to language
 * @access  Private/Admin
 */
router.post(
  '/:id/subsections',
  authenticate,
  LanguageController.addSubSection
);

/**
 * @route   DELETE /api/languages/:id/subsections/:subSectionId
 * @desc    Remove subSection from language
 * @access  Private/Admin
 */
router.delete(
  '/:id/subsections/:subSectionId',
  authenticate,
  LanguageController.removeSubSection
);

export default router;