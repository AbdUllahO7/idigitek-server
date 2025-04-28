import { Request, Response } from 'express';
import { sendSuccess } from '../utils/responseHandler';
import mongoose from 'mongoose';
import subSectionService from '../services/subSection.service';
import { AppError, asyncHandler } from '../middleware/errorHandler.middleware';

class SubSectionController {
  /**
   * Create a new subsection
   * @route POST /api/subsections
   */
  createSubSection = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    console.log('req.body', req.body); // Log the created content element
    const subsection = await subSectionService.createSubSection(req.body);
    sendSuccess(res, subsection, 'Subsection created successfully', 201);
  });
  
  /**
   * Get all subsections
   * @route GET /api/subsections
   */
  getAllSubSections = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const activeOnly = req.query.activeOnly !== 'false';
    const limit = parseInt(req.query.limit as string) || 100;
    const skip = parseInt(req.query.skip as string) || 0;
    const includeContentCount = req.query.includeContentCount === 'true';
    
    const subsections = await subSectionService.getAllSubSections(
      activeOnly, 
      limit, 
      skip,
      includeContentCount
    );
    
    sendSuccess(res, subsections, 'Subsections retrieved successfully');
  });
  
  /**
   * Get subsection by ID
   * @route GET /api/subsections/:id
   */
  getSubSectionById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const populateSectionItem = req.query.populate !== 'false';
    const includeContentElements = req.query.includeContent === 'true';
    
    const subsection = await subSectionService.getSubSectionById(
      req.params.id, 
      populateSectionItem,
      includeContentElements
    );
    
    sendSuccess(res, subsection, 'Subsection retrieved successfully');
  });
  
  /**
   * Get subsection by slug
   * @route GET /api/subsections/slug/:slug
   */
  getSubSectionBySlug = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const populateSectionItem = req.query.populate !== 'false';
    const includeContentElements = req.query.includeContent === 'true';
    
    const subsection = await subSectionService.getSubSectionBySlug(
      req.params.slug, 
      populateSectionItem,
      includeContentElements
    );
    
    sendSuccess(res, subsection, 'Subsection retrieved successfully');
  });
  
  /**
   * Update subsection by ID
   * @route PUT /api/subsections/:id
   */
  updateSubSection = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw AppError.validation('Invalid subsection ID format');
    }
    
    const subsection = await subSectionService.updateSubSectionById(
      req.params.id, 
      req.body
    );
    
    sendSuccess(res, subsection, 'Subsection updated successfully');
  });
  
  /**
   * Delete subsection by ID
   * @route DELETE /api/subsections/:id
   */
  deleteSubSection = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw AppError.validation('Invalid subsection ID format');
    }
    
    const hardDelete = req.query.hardDelete === 'true';
    const result = await subSectionService.deleteSubSectionById(req.params.id, hardDelete);
    
    sendSuccess(res, result, result.message);
  });
  
  /**
   * Update order of multiple subsections
   * @route PUT /api/subsections/order
   */
  updateSubsectionsOrder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { subsections } = req.body;
    
    if (!subsections || !Array.isArray(subsections) || subsections.length === 0) {
      throw AppError.badRequest('Valid subsections array is required');
    }
    
    // Validate each subsection in the array
    subsections.forEach(subsection => {
      if (!subsection.id || !mongoose.Types.ObjectId.isValid(subsection.id)) {
        throw AppError.validation(`Invalid subsection ID: ${subsection.id}`);
      }
      
      if (typeof subsection.order !== 'number') {
        throw AppError.validation(`Order must be a number for subsection ID: ${subsection.id}`);
      }
    });
    
    const result = await subSectionService.updateSubsectionsOrder(subsections);
    
    sendSuccess(res, result, result.message);
  });

  /**
   * Get complete subsection by ID with all content elements and translations
   * @route GET /api/subsections/:id/complete
   */
  getCompleteSubSectionById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const populateSectionItem = req.query.populate !== 'false';
    
    const subsection = await subSectionService.getCompleteSubSectionById(
      req.params.id, 
      populateSectionItem
    );
    
    sendSuccess(res, subsection, 'Complete subsection data retrieved successfully');
  });
    
  /**
   * Get complete subsection by slug with all content elements and translations
   * @route GET /api/subsections/slug/:slug/complete
   */
  getCompleteSubSectionBySlug = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const populateSectionItem = req.query.populate !== 'false';
    
    const subsection = await subSectionService.getCompleteSubSectionBySlug(
      req.params.slug, 
      populateSectionItem
    );
    
    sendSuccess(res, subsection, 'Complete subsection data retrieved successfully');
  });

  /**
   * Get subsections by section item ID
   * @route GET /api/subsections/sectionItem/:sectionItemId
   */
  getSubSectionsBySectionItemId = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const activeOnly = req.query.activeOnly !== 'false';
    const limit = parseInt(req.query.limit as string) || 100;
    const skip = parseInt(req.query.skip as string) || 0;
    const includeContentCount = req.query.includeContentCount === 'true';
    
    const subsections = await subSectionService.getSubSectionsBySectionItemId(
      req.params.sectionItemId,
      activeOnly,
      limit,
      skip,
      includeContentCount
    );
    
    sendSuccess(res, subsections, 'Subsections retrieved successfully');
  });
}

export default new SubSectionController();