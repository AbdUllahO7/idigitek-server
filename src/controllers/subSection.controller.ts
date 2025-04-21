import { Request, Response } from 'express';
import { sendSuccess } from '../utils/responseHandler';
import SubSectionService from '../services/subSection.service';
import { AppError, asyncHandler } from '../middleware/errorHandler.middlerware';
import mongoose from 'mongoose';

class SubSectionController {
  /**
   * Create a new subsection
   * @route POST /api/subsections
   */
  createSubSection = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const subsection = await SubSectionService.createSubSection(req.body);
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
    
    const subsections = await SubSectionService.getAllSubSections(
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
    const populateParents = req.query.populate !== 'false';
    const includeContentElements = req.query.includeContent === 'true';
    
    const subsection = await SubSectionService.getSubSectionById(
      req.params.id, 
      populateParents,
      includeContentElements
    );
    
    sendSuccess(res, subsection, 'Subsection retrieved successfully');
  });
  
  /**
   * Get subsection by slug
   * @route GET /api/subsections/slug/:slug
   */
  getSubSectionBySlug = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const populateParents = req.query.populate !== 'false';
    const includeContentElements = req.query.includeContent === 'true';
    
    const subsection = await SubSectionService.getSubSectionBySlug(
      req.params.slug, 
      populateParents,
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
    
    const subsection = await SubSectionService.updateSubSectionById(
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
    const result = await SubSectionService.deleteSubSectionById(req.params.id, hardDelete);
    
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
    
    const result = await SubSectionService.updateSubsectionsOrder(subsections);
    
    sendSuccess(res, result, result.message);
  });
}

export default new SubSectionController();