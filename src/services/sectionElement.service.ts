import SectionElementModel from '../models/sectionElement.model';
import SectionElementRelationModel from '../models/sectionElementRelation.model';
import { ISectionElement } from '../types/SectionElement.types';
import { ISectionElementRelation } from '../types/sectionElementRelation.types';

class SectionElementService {
  /**
   * Create a new section element
   */
  async createSectionElement(elementData: Partial<ISectionElement>) {
    try {
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
    } catch (error) {
      console.error('Error in createSectionElement service:', error);
      throw error;
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
    } catch (error) {
      console.error('Error in getAllSectionElements service:', error);
      throw error;
    }
  }
  
  /**
   * Get section element by ID
   */
  async getSectionElementById(id: string) {
    try {
      const element = await SectionElementModel.findById(id);
      
      if (!element) {
        throw new Error(`SectionElement with ID ${id} not found`);
      }
      
      return element;
    } catch (error) {
      console.error('Error in getSectionElementById service:', error);
      throw error;
    }
  }
  
  /**
   * Update section element by ID
   */
  async updateSectionElementById(id: string, updateData: Partial<ISectionElement>) {
    try {
      const element = await SectionElementModel.findById(id);
      
      if (!element) {
        throw new Error(`SectionElement with ID ${id} not found`);
      }
      
      const updatedElement = await SectionElementModel.findByIdAndUpdate(
        id,
        { ...updateData },
        { new: true, runValidators: true }
      );
      
      return updatedElement;
    } catch (error) {
      console.error('Error in updateSectionElementById service:', error);
      throw error;
    }
  }
  
  /**
   * Delete section element by ID
   */
  async deleteSectionElementById(id: string, hardDelete = false) {
    try {
      const element = await SectionElementModel.findById(id);
      
      if (!element) {
        throw new Error(`SectionElement with ID ${id} not found`);
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
    } catch (error) {
      console.error('Error in deleteSectionElementById service:', error);
      throw error;
    }
  }
  
  /**
   * Associate element with a section or subsection
   */
  async associateElement(relationData: Partial<ISectionElementRelation>) {
    try {
      // Validate required fields
      if (!relationData.element || !relationData.parent || !relationData.parentType) {
        throw new Error('Missing required fields: element, parent, or parentType');
      }
      
      // Create or update the association
      const relation = await SectionElementRelationModel.findOneAndUpdate(
        { 
          element: relationData.element,
          parent: relationData.parent,
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
    } catch (error) {
      console.error('Error in associateElement service:', error);
      throw error;
    }
  }
  
  /**
   * Get all elements for a parent (section or subsection)
   */
  async getElementsForParent(parentId: string, parentType: 'section' | 'subsection', activeOnly = true) {
    try {
      const query: any = { 
        parent: parentId,
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
    } catch (error) {
      console.error('Error in getElementsForParent service:', error);
      throw error;
    }
  }
  
  /**
   * Get all parents for an element
   */
  async getParentsForElement(elementId: string, activeOnly = true) {
    try {
      const query: any = { element: elementId };
      
      if (activeOnly) {
        query.isActive = true;
      }
      
      const relations = await SectionElementRelationModel.find(query)
        .populate({
          path: 'parent',
          refPath: 'parentType'
        });
      
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
    } catch (error) {
      console.error('Error in getParentsForElement service:', error);
      throw error;
    }
  }
  
  /**
   * Remove association between element and parent
   */
  async removeAssociation(elementId: string, parentId: string, parentType: 'section' | 'subsection', hardDelete = false) {
    try {
      if (hardDelete) {
        // Permanently delete the association
        const result = await SectionElementRelationModel.findOneAndDelete({
          element: elementId,
          parent: parentId,
          parentType
        });
        
        if (!result) {
          throw new Error('Association not found');
        }
        
        return { success: true, message: 'Association deleted successfully' };
      } else {
        // Soft delete - mark as inactive
        const result = await SectionElementRelationModel.findOneAndUpdate(
          { element: elementId, parent: parentId, parentType },
          { isActive: false },
          { new: true }
        );
        
        if (!result) {
          throw new Error('Association not found');
        }
        
        return { success: true, message: 'Association deactivated successfully' };
      }
    } catch (error) {
      console.error('Error in removeAssociation service:', error);
      throw error;
    }
  }
}

export default new SectionElementService();