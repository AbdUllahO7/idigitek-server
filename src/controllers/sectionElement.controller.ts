import { Request, Response } from 'express';
import SectionElementService from '../services/sectionElement.service';

class SectionElementController {
  /**
   * Create a new section element
   * @route POST /api/elements
   */
  async createSectionElement(req: Request, res: Response) {
    try {
      const element = await SectionElementService.createSectionElement(req.body);
      return res.status(201).json({
        success: true,
        data: element
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error creating section element'
      });
    }
  }
  
  /**
   * Get all section elements
   * @route GET /api/elements
   */
  async getAllSectionElements(req: Request, res: Response) {
    try {
      const activeOnly = req.query.activeOnly !== 'false';
      const limit = parseInt(req.query.limit as string) || 100;
      const skip = parseInt(req.query.skip as string) || 0;
      const filterType = req.query.type as string;
      
      const elements = await SectionElementService.getAllSectionElements(
        activeOnly, 
        limit, 
        skip, 
        filterType
      );
      
      return res.status(200).json({
        success: true,
        count: elements.length,
        data: elements
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error fetching section elements'
      });
    }
  }
  
  /**
   * Get section element by ID
   * @route GET /api/elements/:id
   */
  async getSectionElementById(req: Request, res: Response) {
    try {
      const element = await SectionElementService.getSectionElementById(req.params.id);
      
      return res.status(200).json({
        success: true,
        data: element
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || 'Section element not found'
      });
    }
  }
  
  /**
   * Update section element by ID
   * @route PUT /api/elements/:id
   */
  async updateSectionElement(req: Request, res: Response) {
    try {
      const element = await SectionElementService.updateSectionElementById(req.params.id, req.body);
      
      return res.status(200).json({
        success: true,
        data: element
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error updating section element'
      });
    }
  }
  
  /**
   * Delete section element by ID
   * @route DELETE /api/elements/:id
   */
  async deleteSectionElement(req: Request, res: Response) {
    try {
      const hardDelete = req.query.hardDelete === 'true';
      const result = await SectionElementService.deleteSectionElementById(req.params.id, hardDelete);
      
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error deleting section element'
      });
    }
  }
  
  /**
   * Get all parents using this element
   * @route GET /api/elements/:id/parents
   */
  async getElementParents(req: Request, res: Response) {
    try {
      const activeOnly = req.query.activeOnly !== 'false';
      const result = await SectionElementService.getParentsForElement(req.params.id, activeOnly);
      
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error fetching element parents'
      });
    }
  }
  
  /**
   * Create element relation
   * @route POST /api/elements/relations
   */
  async createElementRelation(req: Request, res: Response) {
    try {
      const relation = await SectionElementService.associateElement(req.body);
      
      return res.status(201).json({
        success: true,
        data: relation
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error creating element relation'
      });
    }
  }
}

export default new SectionElementController();