// controllers/ContentTranslationController.ts
import { Request, Response } from 'express';
import { ContentTranslationService } from '../services/ContentTranslation.service';

const contentTranslationService = new ContentTranslationService();

export class ContentTranslationController {
  // Create or update translation
  async createOrUpdateTranslation(req: Request, res: Response) {
    try {
      const { elementId, languageId, value } = req.body;
      
      if (!elementId || !languageId || value === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Element ID, language ID, and value are required'
        });
      }
      
      const translation = await contentTranslationService.createOrUpdateTranslation({
        elementId,
        languageId,
        value
      });
      
      return res.status(201).json({
        success: true,
        data: translation
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get translation by element ID and language ID
  async getTranslation(req: Request, res: Response) {
    try {
      const { elementId, languageId } = req.query;
      
      if (!elementId || !languageId) {
        return res.status(400).json({
          success: false,
          message: 'Element ID and language ID are required'
        });
      }
      
      const translation = await contentTranslationService.getTranslation(
        elementId as string,
        languageId as string
      );
      
      return res.status(200).json({
        success: true,
        data: translation
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all translations for an element
  async getAllTranslationsForElement(req: Request, res: Response) {
    try {
      const { elementId } = req.params;
      
      const translations = await contentTranslationService.getAllTranslationsForElement(elementId);
      
      return res.status(200).json({
        success: true,
        count: translations.length,
        data: translations
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete translation
  async deleteTranslation(req: Request, res: Response) {
    try {
      const result = await contentTranslationService.deleteTranslation(req.params.id);
      
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Bulk create or update translations
  async bulkCreateOrUpdateTranslations(req: Request, res: Response) {
    try {
      const { translations } = req.body;
      
      if (!translations || !Array.isArray(translations) || translations.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid translations array is required'
        });
      }
      
      // Validate each translation in the array
      for (const translation of translations) {
        if (!translation.elementId || !translation.languageId || translation.value === undefined) {
          return res.status(400).json({
            success: false,
            message: 'Each translation must have elementId, languageId, and value'
          });
        }
      }
      
      const results = await contentTranslationService.bulkCreateOrUpdateTranslations(translations);
      
      return res.status(201).json({
        success: true,
        count: results.length,
        data: results
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}