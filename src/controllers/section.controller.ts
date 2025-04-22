// controllers/SectionController.ts
import { Request, Response } from 'express';
import { sendSuccess } from '../utils/responseHandler';
import { SectionService } from '../services/section.service';
import { AppError, asyncHandler } from '../middleware/errorHandler.middlerware';

/**
 * Section Controller
 * Handles all section-related requests
 */
export class SectionController {
  private sectionService: SectionService;

  constructor() {
    this.sectionService = new SectionService();
  }

  /**
   * Create a new section
   */
  createSection = asyncHandler(async (req: Request, res: Response) => {
    const { name, description, image, isActive, order } = req.body;
    
    if (!name) {
      throw AppError.badRequest('name is required');
    }
    
    const section = await this.sectionService.createSection({
      name,
      description,
      image,
      isActive,
      order
    });
    
    return sendSuccess(res, section, 'Section created successfully', 201);
  });

  /**
   * Get all sections with optional filtering
   */
  getAllSections = asyncHandler(async (req: Request, res: Response) => {
    const { isActive } = req.query;
    const query: any = {};
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    const sections = await this.sectionService.getAllSections(query);
    return res.status(200).json({
      success: true,
      count: sections.length,
      data: sections
    });
  });

  /**
   * Get section by ID
   */
  getSectionById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (!id) {
      throw AppError.badRequest('Section ID is required');
    }
    
    const section = await this.sectionService.getSectionById(id);
    
    if (!section) {
      throw AppError.notFound('Section not found');
    }
    
    return sendSuccess(res, section, 'Section retrieved successfully');
  });

  /**
   * Update section
   */
  updateSection = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (!id) {
      throw AppError.badRequest('Section ID is required');
    }
    
    const section = await this.sectionService.updateSection(id, req.body);
    
    if (!section) {
      throw AppError.notFound('Section not found');
    }
    
    return sendSuccess(res, section, 'Section updated successfully');
  });

  /**
   * Update section active status
   */
  updateSectionStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isActive } = req.body;
    
    if (!id) {
      throw AppError.badRequest('Section ID is required');
    }
    
    if (isActive === undefined) {
      throw AppError.badRequest('isActive status is required');
    }
    
    if (typeof isActive !== 'boolean') {
      throw AppError.badRequest('isActive must be a boolean value');
    }
    
    const section = await this.sectionService.updateSectionStatus(id, isActive);
    
    if (!section) {
      throw AppError.notFound('Section not found');
    }
    
    return sendSuccess(res, section, `Section status ${isActive ? 'activated' : 'deactivated'} successfully`);
  });

  /**
   * Delete section
   */
  deleteSection = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (!id) {
      throw AppError.badRequest('Section ID is required');
    }
    
    const result = await this.sectionService.deleteSection(id);
    
    return sendSuccess(res, result, 'Section deleted successfully');
  });

  /**
   * Get section with content by ID and language
   */
  getSectionWithContent = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { languageId } = req.query;
    
    if (!id) {
      throw AppError.badRequest('Section ID is required');
    }
    
    if (!languageId) {
      throw AppError.badRequest('Language ID is required');
    }
    
    const section = await this.sectionService.getSectionWithContent(id, languageId as string);
    
    if (!section) {
      throw AppError.notFound('Section not found');
    }
    
    return sendSuccess(res, section, 'Section with content retrieved successfully');
  });
}