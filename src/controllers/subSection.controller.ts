import { Request, Response } from 'express';
import SectionElementService from '../services/sectionElement.service';
import subSectionService from '../services/subSection.service';

class SubSectionController {
  /**
   * Create a new subsection
   * @route POST /api/subsections
   */
  async createSubSection(req: Request, res: Response) {
    try {
      const subsection = await subSectionService.createSubSection(req.body);
      return res.status(201).json({
        success: true,
        data: subsection
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error creating subsection'
      });
    }
  }
  
  /**
   * Get all subsections
   * @route GET /api/subsections
   */
  async getAllSubSections(req: Request, res: Response) {
    try {
      const activeOnly = req.query.activeOnly !== 'false';
      const limit = parseInt(req.query.limit as string) || 100;
      const skip = parseInt(req.query.skip as string) || 0;
      
      const subsections = await subSectionService.getAllSubSections(activeOnly, limit, skip);
      
      return res.status(200).json({
        success: true,
        count: subsections.length,
        data: subsections
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error fetching subsections'
      });
    }
  }
  
  /**
   * Get subsection by ID
   * @route GET /api/subsections/:id
   */
  async getSubSectionById(req: Request, res: Response) {
    try {
      const populateParents = req.query.populate !== 'false';
      const subsection = await subSectionService.getSubSectionById(req.params.id, populateParents);
      
      return res.status(200).json({
        success: true,
        data: subsection
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || 'Subsection not found'
      });
    }
  }
  
  /**
   * Update subsection by ID
   * @route PUT /api/subsections/:id
   */
  async updateSubSection(req: Request, res: Response) {
    try {
      const subsection = await subSectionService.updateSubSectionById(req.params.id, req.body);
      
      return res.status(200).json({
        success: true,
        data: subsection
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error updating subsection'
      });
    }
  }
  
  /**
   * Delete subsection by ID
   * @route DELETE /api/subsections/:id
   */
  async deleteSubSection(req: Request, res: Response) {
    try {
      const hardDelete = req.query.hardDelete === 'true';
      const result = await subSectionService.deleteSubSectionById(req.params.id, hardDelete);
      
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error deleting subsection'
      });
    }
  }
  
  /**
   * Get all elements for a subsection
   * @route GET /api/subsections/:id/elements
   */
  async getSubSectionElements(req: Request, res: Response) {
    try {
      const activeOnly = req.query.activeOnly !== 'false';
      const result = await SectionElementService.getElementsForParent(
        req.params.id, 
        'subsection', 
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
        message: error.message || 'Error fetching subsection elements'
      });
    }
  }
  
  /**
   * Add element to subsection
   * @route POST /api/subsections/:id/elements
   */
  async addElementToSubSection(req: Request, res: Response) {
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
        parentType: 'subsection',
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
        message: error.message || 'Error adding element to subsection'
      });
    }
  }
  
  /**
   * Remove element from subsection
   * @route DELETE /api/subsections/:id/elements/:elementId
   */
  async removeElementFromSubSection(req: Request, res: Response) {
    try {
      const hardDelete = req.query.hardDelete === 'true';
      const result = await SectionElementService.removeAssociation(
        req.params.elementId,
        req.params.id,
        'subsection',
        hardDelete
      );
      
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error removing element from subsection'
      });
    }
  }

}

export default new SubSectionController();