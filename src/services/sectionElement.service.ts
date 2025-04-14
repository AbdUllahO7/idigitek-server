import mongoose, { Types } from 'mongoose';
import SectionElementModel from '../models/sectionElement.model';
import SectionElementRelationModel from '../models/sectionElementRelation.model';
import { ISectionElement } from '../types/SectionElement.types';
import { AppError } from '../middleware/errorHandler.middlerware';
import { ExtendedPopulateOptions } from 'src/types/moongoseExtinstions';

class SectionElementService {
  /**
   * Create a new section element
   */
  async createSectionElement(elementData: Partial<ISectionElement>) {
    try {
      if (!elementData.name) {
        throw AppError.validation('Element name is required');
      }
      
      if (!elementData.type) {
        throw AppError.validation('Element type is required');
      }
      
      const element = new SectionElementModel({
        name: elementData.name,
        type: elementData.type,
        text: elementData.text,
        image: elementData.image,
        icon: elementData.icon,
        images: elementData.images,
        url: elementData.url,
        customData: elementData.customData,
        order: elementData.order || 0,
        isActive: elementData.isActive !== undefined ? elementData.isActive : true,
      });
      
      await element.save();
      return element;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.database('Error creating section element', { error: error.message });
    }
  }
  
  /**
   * Get all section elements
   */
  async getAllSectionElements(activeOnly = true, limit = 100, skip = 0, filterType?: string) {
    try {
      let query: any = activeOnly ? { isActive: true } : {};
      
      if (filterType) {
        query.type = filterType;
      }
      
      const elements = await SectionElementModel.find(query)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      return elements;
    } catch (error: any) {
      throw AppError.database('Error fetching section elements', { error: error.message });
    }
  }
  
  /**
   * Get section element by ID
   */
  async getSectionElementById(id: string) {
    try {
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw AppError.validation('Invalid element ID format');
      }
      
      const element = await SectionElementModel.findById(id);
      
      if (!element) {
        throw AppError.notFound(`SectionElement with ID ${id} not found`);
      }
      
      return element;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.database('Error fetching section element', { error: error.message });
    }
  }
  
  /**
   * Update section element by ID
   */
  async updateSectionElementById(id: string, updateData: Partial<ISectionElement>) {
    try {
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw AppError.validation('Invalid element ID format');
      }
      
      const element = await SectionElementModel.findById(id);
      
      if (!element) {
        throw AppError.notFound(`SectionElement with ID ${id} not found`);
      }
      
      const updatedElement = await SectionElementModel.findByIdAndUpdate(
        id,
        { ...updateData },
        { new: true, runValidators: true }
      );
      
      return updatedElement;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.database('Error updating section element', { error: error.message });
    }
  }
  
  /**
   * Delete section element by ID
   */
  async deleteSectionElementById(id: string, hardDelete = false) {
    try {
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw AppError.validation('Invalid element ID format');
      }
      
      const element = await SectionElementModel.findById(id);
      
      if (!element) {
        throw AppError.notFound(`SectionElement with ID ${id} not found`);
      }
      
      if (hardDelete) {
        // Permanently delete
        await SectionElementModel.findByIdAndDelete(id);
        
        // Remove all relationships involving this element
        await SectionElementRelationModel.deleteMany({ element: id });
      } else {
        // Soft delete
        await SectionElementModel.findByIdAndUpdate(id, { isActive: false });
        
        // Mark all relationships as inactive
        await SectionElementRelationModel.updateMany(
          { element: id },
          { isActive: false }
        );
      }
      
      return { success: true, message: `SectionElement ${hardDelete ? 'deleted' : 'deactivated'} successfully` };
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.database('Error deleting section element', { error: error.message });
    }
  }
  
  /**
   * Associate element with a section or subsection
   */
  async associateElement(relationData: {
    element: Types.ObjectId | string;
    parent: Types.ObjectId | string;
    parentType: 'section' | 'subsection';
    order?: number;
    isActive?: boolean;
    config?: any;
  }) {
    try {
      // Validate required fields
      if (!relationData.element || !relationData.parent || !relationData.parentType) {
        throw AppError.validation('Missing required fields: element, parent, or parentType');
      }
      
      // Ensure IDs are ObjectIds
      const elementId = typeof relationData.element === 'string' 
        ? new Types.ObjectId(relationData.element) 
        : relationData.element;
        
      const parentId = typeof relationData.parent === 'string'
        ? new Types.ObjectId(relationData.parent)
        : relationData.parent;
      
      // Verify the element exists
      const elementExists = await SectionElementModel.exists({ _id: elementId });
      if (!elementExists) {
        throw AppError.notFound('Element not found');
      }
      
      // Create or update the association
      const relation = await SectionElementRelationModel.findOneAndUpdate(
        { 
          element: elementId,
          parent: parentId,
          parentType: relationData.parentType
        },
        { 
          order: relationData.order || 0,
          isActive: relationData.isActive !== undefined ? relationData.isActive : true,
          config: relationData.config || {}
        },
        { upsert: true, new: true }
      );
      
      return relation;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.database('Error associating element', { error: error.message });
    }
  }
  
  /**
   * Get all elements for a parent (section or subsection)
   */
  async getElementsForParent(parentId: string, parentType: 'section' | 'subsection', activeOnly = true) {
    try {
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        throw AppError.validation(`Invalid ${parentType} ID format`);
      }
      
      const query: any = { 
        parent: new Types.ObjectId(parentId),
        parentType
      };
      
      if (activeOnly) {
        query.isActive = true;
      }
      
      const relations = await SectionElementRelationModel.find(query)
        .sort({ order: 1 })
        .populate({
          path: 'element',
          match: activeOnly ? { isActive: true } : {}
        });
      
      // Filter out any relations where the element is null (could happen if element is deleted)
      const validRelations = relations.filter(rel => rel.element);
      
      // Return both the relations and the elements
      return {
        relations: validRelations,
        elements: validRelations.map(rel => rel.element)
      };
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.database('Error getting elements for parent', { error: error.message });
    }
  }
  
  /**
   * Get all parents for an element
   */
  async getParentsForElement(elementId: string, activeOnly = true) {
    try {
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(elementId)) {
        throw AppError.validation('Invalid element ID format');
      }
      
      const query: any = { element: new Types.ObjectId(elementId) };
      
      if (activeOnly) {
        query.isActive = true;
      }
      const populateOptions: ExtendedPopulateOptions = {
        path: 'parent',
        refPath: 'parentType'
      };
      
      const relations = await SectionElementRelationModel.find(query)
      .populate(populateOptions);

      
      // Filter out any relations where the parent is null
      const validRelations = relations.filter(rel => rel.parent);
      
      // Group by parent type
      const sectionRelations = validRelations.filter(rel => rel.parentType === 'section');
      const subsectionRelations = validRelations.filter(rel => rel.parentType === 'subsection');
      
      return {
        sections: sectionRelations.map(rel => rel.parent),
        subsections: subsectionRelations.map(rel => rel.parent),
        sectionRelations,
        subsectionRelations
      };
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.database('Error getting parents for element', { error: error.message });
    }
  }
  
  /**
   * Remove association between element and parent
   */
  async removeAssociation(
    elementId: Types.ObjectId | string, 
    parentId: Types.ObjectId | string, 
    parentType: 'section' | 'subsection', 
    hardDelete = false
  ) {
    try {
      // Ensure IDs are ObjectIds
      const elemId = typeof elementId === 'string' 
        ? new Types.ObjectId(elementId) 
        : elementId;
        
      const parId = typeof parentId === 'string'
        ? new Types.ObjectId(parentId)
        : parentId;
      
      if (hardDelete) {
        // Permanently delete the association
        const result = await SectionElementRelationModel.findOneAndDelete({
          element: elemId,
          parent: parId,
          parentType
        });
        
        if (!result) {
          throw AppError.notFound('Association not found');
        }
        
        return { success: true, message: 'Association deleted successfully' };
      } else {
        // Soft delete - mark as inactive
        const result = await SectionElementRelationModel.findOneAndUpdate(
          { element: elemId, parent: parId, parentType },
          { isActive: false },
          { new: true }
        );
        
        if (!result) {
          throw AppError.notFound('Association not found');
        }
        
        return { success: true, message: 'Association deactivated successfully' };
      }
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.database('Error removing association', { error: error.message });
    }
  }
}

export default new SectionElementService();