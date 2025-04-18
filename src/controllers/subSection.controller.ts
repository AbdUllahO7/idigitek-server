// controllers/SubSectionController.ts
import { Request, Response } from 'express';
import { SubSectionService } from '../services/subSection.service';

const subSectionService = new SubSectionService();

export class SubSectionController {
  // Create a new subsection
  async createSubSection(req: Request, res: Response) {
    try {
      const { name, description, sectionId, isActive, order } = req.body;
      
      if (!sectionId) {
        return res.status(400).json({
          success: false,
          message: 'Section ID is required'
        });
      }
      
      const subsection = await subSectionService.createSubSection({
        name,
        description,
        sectionId,
        isActive,
        order
      });
      
      return res.status(201).json({
        success: true,
        data: subsection
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all subsections
  async getAllSubSections(req: Request, res: Response) {
    try {
      const { sectionId, isActive } = req.query;
      const query: any = {};
      
      if (sectionId) {
        query.sectionId = sectionId;
      }
      
      if (isActive !== undefined) {
        query.isActive = isActive === 'true';
      }
      
      const subsections = await subSectionService.getAllSubSections(query);
      
      return res.status(200).json({
        success: true,
        count: subsections.length,
        data: subsections
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get subsection by ID
  async getSubSectionById(req: Request, res: Response) {
    try {
      const subsection = await subSectionService.getSubSectionById(req.params.id);
      
      return res.status(200).json({
        success: true,
        data: subsection
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update subsection
  async updateSubSection(req: Request, res: Response) {
    try {
      const subsection = await subSectionService.updateSubSection(req.params.id, req.body);
      
      return res.status(200).json({
        success: true,
        data: subsection
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete subsection
  async deleteSubSection(req: Request, res: Response) {
    try {
      const result = await subSectionService.deleteSubSection(req.params.id);
      
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

  // Get subsection with content by ID and language
  async getSubSectionWithContent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { languageId } = req.query;
      
      if (!languageId) {
        return res.status(400).json({
          success: false,
          message: 'Language ID is required'
        });
      }
      
      const subsection = await subSectionService.getSubSectionWithContent(id, languageId as string);
      
      return res.status(200).json({
        success: true,
        data: subsection
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
}