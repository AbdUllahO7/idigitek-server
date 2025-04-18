// controllers/LanguageController.ts
import { Request, Response } from 'express';
import { LanguageService } from '../services/language.service';

const languageService = new LanguageService();

export class LanguageController {
  // Create a new language
  async createLanguage(req: Request, res: Response) {
    try {
      const { name, code, isActive } = req.body;
      
      if (!name || !code) {
        return res.status(400).json({
          success: false,
          message: 'Name and code are required'
        });
      }
      
      const language = await languageService.createLanguage({
        name,
        code,
        isActive
      });
      
      return res.status(201).json({
        success: true,
        data: language
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all languages
  async getAllLanguages(req: Request, res: Response) {
    try {
      const { isActive } = req.query;
      const query: any = {};
      
      if (isActive !== undefined) {
        query.isActive = isActive === 'true';
      }
      
      const languages = await languageService.getAllLanguages(query);
      
      return res.status(200).json({
        success: true,
        count: languages.length,
        data: languages
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get language by ID
  async getLanguageById(req: Request, res: Response) {
    try {
      const language = await languageService.getLanguageById(req.params.id);
      
      return res.status(200).json({
        success: true,
        data: language
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update language
  async updateLanguage(req: Request, res: Response) {
    try {
      const language = await languageService.updateLanguage(req.params.id, req.body);
      
      return res.status(200).json({
        success: true,
        data: language
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete language
  async deleteLanguage(req: Request, res: Response) {
    try {
      const result = await languageService.deleteLanguage(req.params.id);
      
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
}