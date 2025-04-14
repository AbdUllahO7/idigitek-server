import { Request, Response } from 'express';
import SectionService from '../services/section.service';
import SectionElementService from '../services/sectionElement.service';

class SectionController {
  /**
   * Create a new section
   * @route POST /api/sections
   */
  async createSection(req: Request, res: Response) {
    try {
      const section = await SectionService.createSection(req.body);
      return res.status(201).json({
        success: true,
        data: section
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error creating section'
      });
    }
  }
  
  /**
   * Get all sections
   * @route GET /api/sections
   */
  async getAllSections(req: Request, res: Response) {
    try {
      const activeOnly = req.query.activeOnly !== 'false';
      const limit = parseInt(req.query.limit as string) || 100;
      const skip = parseInt(req.query.skip as string) || 0;
      
      const sections = await SectionService.getAllSections(activeOnly, limit, skip);
      
      return res.status(200).json({
        success: true,
        count: sections.length,
        data: sections
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error fetching sections'
      });
    }
  }
  
  /**
   * Get section by ID
   * @route GET /api/sections/:id
   */
  async getSectionById(req: Request, res: Response) {
    try {
      const populateSubSections = req.query.populate !== 'false';
      const section = await SectionService.getSectionById(req.params.id, populateSubSections);
      
      return res.status(200).json({
        success: true,
        data: section
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || 'Section not found'
      });
    }
  }
  
  /**
   * Update section by ID
   * @route PUT /api/sections/:id
   */
  async updateSection(req: Request, res: Response) {
    try {
      const section = await SectionService.updateSectionById(req.params.id, req.body);
      
      return res.status(200).json({
        success: true,
        data: section
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error updating section'
      });
    }
  }
  
  /**
   * Delete section by ID
   * @route DELETE /api/sections/:id
   */
  async deleteSection(req: Request, res: Response) {
    try {
      const hardDelete = req.query.hardDelete === 'true';
      const result = await SectionService.deleteSectionById(req.params.id, hardDelete);
      
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error deleting section'
      });
    }
  }
  
  /**
   * Get all elements for a section
   * @route GET /api/sections/:id/elements
   */
  async getSectionElements(req: Request, res: Response) {
    try {
      const activeOnly = req.query.activeOnly !== 'false';
      const result = await SectionElementService.getElementsForParent(
        req.params.id, 
        'section', 
        activeOnly
      );
      
      return res.status(200).json({
        success: true,
        count: result.elements.length,
        data: result
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error fetching section elements'
      });
    }
  }
  
  /**
   * Add element to section
   * @route POST /api/sections/:id/elements
   */
  async addElementToSection(req: Request, res: Response) {
    try {
      const { elementId, order, config } = req.body;
      
      if (!elementId) {
        return res.status(400).json({
          success: false,
          message: 'Element ID is required'
        });
      }
      
      const relation = await SectionElementService.associateElement({
        element: elementId,
        parent: req.params.id,
        parentType: 'section',
        order,
        config
      });
      
      return res.status(201).json({
        success: true,
        data: relation
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error adding element to section'
      });
    }
  }
  
  /**
   * Remove element from section
   * @route DELETE /api/sections/:id/elements/:elementId
   */
  async removeElementFromSection(req: Request, res: Response) {
    try {
      const hardDelete = req.query.hardDelete === 'true';
      const result = await SectionElementService.removeAssociation(
        req.params.elementId,
        req.params.id,
        'section',
        hardDelete
      );
      
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error removing element from section'
      });
    }
  }
}

export default new SectionController();