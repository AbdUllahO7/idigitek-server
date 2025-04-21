import { Request, Response } from 'express';
import { sendSuccess } from '../utils/responseHandler';
import { AppError, asyncHandler } from '../middleware/errorHandler.middlerware';
import mongoose from 'mongoose';
import ContentElementService from '../services/ContentElement.service';

class ContentElementController {
  /**
   * Create a new content element
   * @route POST /api/content-elements
   */
  createContentElement = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const contentElement = await ContentElementService.createContentElement(req.body);
    sendSuccess(res, contentElement, 'Content element created successfully', 201);
  });

  /**
   * Get content element by ID
   * @route GET /api/content-elements/:id
   */
  getContentElementById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const populateTranslations = req.query.translations === 'true';
    const contentElement = await ContentElementService.getContentElementById(
      req.params.id, 
      populateTranslations
    );
    
    sendSuccess(res, contentElement, 'Content element retrieved successfully');
  });

  /**
   * Get all content elements for a subsection
   * @route GET /api/content-elements/subsection/:subsectionId
   */
  getContentElementsBySubsection = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const activeOnly = req.query.activeOnly !== 'false';
    const populateTranslations = req.query.translations === 'true';
    
    const contentElements = await ContentElementService.getContentElementsBySubsection(
      req.params.subsectionId,
      activeOnly,
      populateTranslations
    );
    
    sendSuccess(res, contentElements, 'Content elements retrieved successfully');
  });

  /**
   * Update content element by ID
   * @route PUT /api/content-elements/:id
   */
  updateContentElement = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const contentElement = await ContentElementService.updateContentElement(
      req.params.id,
      req.body
    );
    
    sendSuccess(res, contentElement, 'Content element updated successfully');
  });

  /**
   * Delete content element by ID
   * @route DELETE /api/content-elements/:id
   */
  deleteContentElement = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const hardDelete = req.query.hardDelete === 'true';
    
    const result = await ContentElementService.deleteContentElement(
      req.params.id,
      hardDelete
    );
    
    sendSuccess(res, result, result.message);
  });

  /**
   * Update order of multiple content elements
   * @route PUT /api/content-elements/order
   */
  updateElementsOrder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { elements } = req.body;
    
    if (!elements || !Array.isArray(elements) || elements.length === 0) {
      throw AppError.badRequest('Valid elements array is required');
    }
    
    // Validate each element in the array
    elements.forEach(element => {
      if (!element.id || !mongoose.Types.ObjectId.isValid(element.id)) {
        throw AppError.validation(`Invalid element ID: ${element.id}`);
      }
      
      if (typeof element.order !== 'number') {
        throw AppError.validation(`Order must be a number for element ID: ${element.id}`);
      }
    });
    
    const result = await ContentElementService.updateElementsOrder(elements);
    
    sendSuccess(res, result, result.message);
  });
}

export default new ContentElementController();