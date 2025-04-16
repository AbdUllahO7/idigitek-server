import { Request, Response } from 'express';
import { sendSuccess } from '../utils/responseHandler';
import SectionService from '../services/section.service';
import SectionElementService from '../services/sectionElement.service';
import mongoose from 'mongoose';
import { AppError, asyncHandler } from '../middleware/errorHandler.middlerware';

class SectionController {
  /**
   * Create a new section
   * @route POST /api/sections
   */
    createSection = asyncHandler(async (req: Request, res: Response) => {
      const section = await SectionService.createSection(req.body);
      return sendSuccess(res, section, 'Section created successfully', 201);
    });
  
  /**
   * Get all sections
   * @route GET /api/sections
   */
    getAllSections = asyncHandler(async (req: Request, res: Response) => {
      const activeOnly = req.query.activeOnly !== 'false';
      const limit = parseInt(req.query.limit as string) || 100;
      const skip = parseInt(req.query.skip as string) || 0;
      
      const sections = await SectionService.getAllSections(activeOnly, limit, skip);
      
      return sendSuccess(res, {
        count: sections.length,
        data: sections
      }, 'Sections retrieved successfully');
    });
  
  /**
   * Get section by ID
   * @route GET /api/sections/:id
   */
    getSectionById = asyncHandler(async (req: Request, res: Response) => {
      const populateSubSections = req.query.populate !== 'false';
      const section = await SectionService.getSectionById(req.params.id, populateSubSections);
      
      return sendSuccess(res, section, 'Section retrieved successfully');
    });
  
  /**
   * Update section by ID
   * @route PUT /api/sections/:id
   */
    updateSection = asyncHandler(async (req: Request, res: Response) => {
      const section = await SectionService.updateSectionById(req.params.id, req.body);
      
      return sendSuccess(res, section, 'Section updated successfully');
    });
  
  /**
   * Delete section by ID
   * @route DELETE /api/sections/:id
  */
    deleteSection = asyncHandler(async (req: Request, res: Response) => {
      const hardDelete = req.query.hardDelete === 'true';
      const result = await SectionService.deleteSectionById(req.params.id, hardDelete);
      
      return sendSuccess(res, result, `Section ${hardDelete ? 'deleted' : 'deactivated'} successfully`);
    });
  
  /**
   * Get all elements for a section
   * @route GET /api/sections/:id/elements
   */
    getSectionElements = asyncHandler(async (req: Request, res: Response) => {
      const activeOnly = req.query.activeOnly !== 'false';
      const result = await SectionElementService.getElementsForParent(
        req.params.id, 
        'section', 
        activeOnly
      );
      
      return sendSuccess(res, {
        count: result.elements.length,
        data: result
      }, 'Section elements retrieved successfully');
    });
  
  /**
   * Add element to section
   * @route POST /api/sections/:id/elements
   */
    addElementToSection = asyncHandler(async (req: Request, res: Response) => {
      const { elementId, order, config } = req.body;
      
      if (!elementId) {
        throw AppError.badRequest('Element ID is required');
      }
      
      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw AppError.validation('Invalid section ID format');
      }
      
      if (!mongoose.Types.ObjectId.isValid(elementId)) {
        throw AppError.validation('Invalid element ID format');
      }
      
      // Convert string ID to ObjectId
      const sectionId = new mongoose.Types.ObjectId(req.params.id);
      const elemId = new mongoose.Types.ObjectId(elementId);
      
      const relation = await SectionElementService.associateElement({
        element: elemId,
        parent: sectionId,
        parentType: 'section',
        order,
        config
      });
      
      return sendSuccess(res, relation, 'Element added to section successfully', 201);
    });
    
  /**
   * Remove element from section
   * @route DELETE /api/sections/:id/elements/:elementId
   */
  removeElementFromSection = asyncHandler(async (req: Request, res: Response) => {
    const hardDelete = req.query.hardDelete === 'true';
    
    // Validate ID formats
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw AppError.validation('Invalid section ID format');
    }
    
    if (!mongoose.Types.ObjectId.isValid(req.params.elementId)) {
      throw AppError.validation('Invalid element ID format');
    }
    
    // Convert string IDs to ObjectIds
    const sectionId = new mongoose.Types.ObjectId(req.params.id);
    const elementId = new mongoose.Types.ObjectId(req.params.elementId);
    
    const result = await SectionElementService.removeAssociation(
      elementId,
      sectionId,
      'section',
      hardDelete
    );
    
    return sendSuccess(res, result, `Element ${hardDelete ? 'removed from' : 'deactivated in'} section successfully`);
  });
}

export default new SectionController();