import { Request, Response } from 'express';
import { sendSuccess } from '../utils/responseHandler';
import { AppError, asyncHandler } from '../middleware/errorHandler.middleware';
import { UserSectionService } from '../services/UserSection.service';

/**
 * UserSection Controller
 * Handles the relationship between users and sections
 */
export class UserSectionController {
  private userSectionService: UserSectionService;
  
  constructor() {
    this.userSectionService = new UserSectionService();
  }
  
  /**
   * Get all active sections for a user
   * @route GET /api/user-sections/:userId
   */
  getUserSections = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    
    if (!userId) {
      throw AppError.badRequest('User ID is required');
    }
    
    const sections = await this.userSectionService.getUserActiveSections(userId);
    
    return sendSuccess(res, sections, 'User active sections retrieved successfully');
  });
  
  /**
   * Activate a section for a user
   * @route POST /api/user-sections/:userId/:sectionId/activate
   */
  activateSection = asyncHandler(async (req: Request, res: Response) => {
    const { userId, sectionId } = req.params;
    
    if (!userId || !sectionId) {
      throw AppError.badRequest('User ID and Section ID are required');
    }
    
    const result = await this.userSectionService.activateSectionForUser(userId, sectionId);
    
    return sendSuccess(res, result, 'Section activated for user successfully');
  });
  
  /**
   * Deactivate a section for a user
   * @route POST /api/user-sections/:userId/:sectionId/deactivate
   */
  deactivateSection = asyncHandler(async (req: Request, res: Response) => {
    const { userId, sectionId } = req.params;
    
    if (!userId || !sectionId) {
      throw AppError.badRequest('User ID and Section ID are required');
    }
    
    const result = await this.userSectionService.deactivateSectionForUser(userId, sectionId);
    
    return sendSuccess(res, result, 'Section deactivated for user successfully');
  });
  
  /**
   * Toggle a section status for a user
   * @route POST /api/user-sections/:userId/:sectionId/toggle
   */
  toggleSection = asyncHandler(async (req: Request, res: Response) => {
    const { userId, sectionId } = req.params;
    
    if (!userId || !sectionId) {
      throw AppError.badRequest('User ID and Section ID are required');
    }
    
    const result = await this.userSectionService.toggleSectionForUser(userId, sectionId);
    
    return sendSuccess(res, result, result.message);
  });
  
  /**
   * Get all users who have a specific section active
   * @route GET /api/user-sections/section/:sectionId/users
   */
  getUsersBySection = asyncHandler(async (req: Request, res: Response) => {
    const { sectionId } = req.params;
    
    if (!sectionId) {
      throw AppError.badRequest('Section ID is required');
    }
    
    const users = await this.userSectionService.getUsersWithActiveSection(sectionId);
    
    return sendSuccess(res, users, 'Users with active section retrieved successfully');
  });
}