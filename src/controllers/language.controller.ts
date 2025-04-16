import { Request, Response } from 'express';
import { sendSuccess } from '../utils/responseHandler';
import LanguageService from '../services/language.service';
import mongoose from 'mongoose';
import { AppError, asyncHandler } from '../middleware/errorHandler.middlerware';

class LanguageController {
  /**
   * Create a new language
   * @route POST /api/languages
   */
  createLanguage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const language = await LanguageService.createLanguage(req.body);
    sendSuccess(res, language, 'Language created successfully', 201);
  });

  /**
   * Get all languages
   * @route GET /api/languages
   */
  getAllLanguages = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const limit = parseInt(req.query.limit as string) || 100;
    const skip = parseInt(req.query.skip as string) || 0;
    
    const languages = await LanguageService.getAllLanguages(limit, skip);
    
    // Send the languages array directly instead of wrapping it in an object
    sendSuccess(res, languages, 'Languages retrieved successfully');
  });

  /**
   * Get language by ID
   * @route GET /api/languages/:id
   */
  getLanguageById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const populateSubSections = req.query.populate !== 'false';
    const language = await LanguageService.getLanguageById(req.params.id, populateSubSections);
    
    sendSuccess(res, language, 'Language retrieved successfully');
  });

  /**
   * Get language by code (languageID)
   * @route GET /api/languages/code/:languageID
   */
  getLanguageByCode = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const populateSubSections = req.query.populate !== 'false';
    const language = await LanguageService.getLanguageByCode(req.params.languageID, populateSubSections);
    
    sendSuccess(res, language, 'Language retrieved successfully');
  });

  /**
   * Update language by ID
   * @route PUT /api/languages/:id
   */
  updateLanguage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const language = await LanguageService.updateLanguageById(req.params.id, req.body);
    
    sendSuccess(res, language, 'Language updated successfully');
  });

  /**
   * Update only the isActive status of a language
   * @route PATCH /api/languages/:id/status
   */
  updateLanguageStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { isActive } = req.body;
    
    if (isActive === undefined || typeof isActive !== 'boolean') {
      throw AppError.badRequest('isActive must be a boolean value');
    }
    
    const language = await LanguageService.updateLanguageActiveStatus(req.params.id, isActive);
    
    sendSuccess(res, language, `Language status updated to ${isActive ? 'active' : 'inactive'} successfully`);
  });

  /**
   * Delete language by ID
   * @route DELETE /api/languages/:id
   */
  deleteLanguage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await LanguageService.deleteLanguageById(req.params.id);
    
    sendSuccess(res, result, 'Language deleted successfully');
  });

  /**
   * Add subSection to language
   * @route POST /api/languages/:id/subsections
   */
  addSubSection = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { subSectionId } = req.body;
    
    if (!subSectionId) {
      throw AppError.badRequest('SubSection ID is required');
    }
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw AppError.validation('Invalid language ID format');
    }
    
    if (!mongoose.Types.ObjectId.isValid(subSectionId)) {
      throw AppError.validation('Invalid subSection ID format');
    }
    
    const language = await LanguageService.addSubSection(req.params.id, subSectionId);
    
    sendSuccess(res, language, 'SubSection added to language successfully');
  });

  /**
   * Remove subSection from language
   * @route DELETE /api/languages/:id/subsections/:subSectionId
   */
  removeSubSection = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Validate ID formats
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw AppError.validation('Invalid language ID format');
    }
    
    if (!mongoose.Types.ObjectId.isValid(req.params.subSectionId)) {
      throw AppError.validation('Invalid subSection ID format');
    }
    
    const language = await LanguageService.removeSubSection(req.params.id, req.params.subSectionId);
    
    sendSuccess(res, language, 'SubSection removed from language successfully');
  });
}

export default new LanguageController();