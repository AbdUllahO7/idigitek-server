// controllers/ContentElementController.ts
import { Request, Response } from 'express';
import { ContentElementService } from '../services/ContentElement.service';

const contentElementService = new ContentElementService();

export class ContentElementController {
  // Create a new content element
  async createContentElement(req: Request, res: Response) {
    try {
      const { key, type, parentType, parentId, order, isActive } = req.body;
      
      if (!key || !type || !parentType || !parentId) {
        return res.status(400).json({
          success: false,
          message: 'Key, type, parentType, and parentId are required'
        });
      }
      
      const element = await contentElementService.createContentElement({
        key,
        type,
        parentType,
        parentId,
        order,
        isActive
      });
      
      return res.status(201).json({
        success: true,
        data: element
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all content elements
  async getAllContentElements(req: Request, res: Response) {
    try {
      const { parentType, parentId, type, isActive } = req.query;
      const query: any = {};
      
      if (parentType) {
        query.parentType = parentType;
      }
      
      if (parentId) {
        query.parentId = parentId;
      }
      
      if (type) {
        query.type = type;
      }
      
      if (isActive !== undefined) {
        query.isActive = isActive === 'true';
      }
      
      const elements = await contentElementService.getAllContentElements(query);
      
      return res.status(200).json({
        success: true,
        count: elements.length,
        data: elements
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get content element by ID
  async getContentElementById(req: Request, res: Response) {
    try {
      const element = await contentElementService.getContentElementById(req.params.id);
      
      return res.status(200).json({
        success: true,
        data: element
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update content element
  async updateContentElement(req: Request, res: Response) {
    try {
      const element = await contentElementService.updateContentElement(req.params.id, req.body);
      
      return res.status(200).json({
        success: true,
        data: element
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete content element
  async deleteContentElement(req: Request, res: Response) {
    try {
      const result = await contentElementService.deleteContentElement(req.params.id);
      
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

  // Get content element with translations
  async getContentElementWithTranslations(req: Request, res: Response) {
    try {
      const element = await contentElementService.getContentElementWithTranslations(req.params.id);
      
      return res.status(200).json({
        success: true,
        data: element
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
}