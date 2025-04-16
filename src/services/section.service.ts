import mongoose from 'mongoose';
import { ISectionBasicInfo } from '../types/sectionBasicInfo.types';
import { AppError } from '../middleware/errorHandler.middlerware';
import SectionBasicInfoModel from '../models/sectionBasicInfo.model';

class SectionService {
  /**
   * Create a new section
   * @param sectionData The section data to create
   * @returns Promise with the created section
   */
  async createSection(sectionData: Partial<ISectionBasicInfo>): Promise<ISectionBasicInfo> {
    try {
      // Check if section already exists with the same name
      const existingSection = await SectionBasicInfoModel.findOne({ 
        section_name: sectionData.section_name 
      });
      
      if (existingSection) {
        throw AppError.badRequest(`Section '${sectionData.section_name}' already exists`);
      }
      
      // Create new section (isActive will default to false)
      const section = new SectionBasicInfoModel(sectionData);
      return await section.save();
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.badRequest('Failed to create section', error);
    }
  }

  /**
   * Get all sections
   * @param activeOnly Whether to return only active sections
   * @param limit Maximum number of sections to return
   * @param skip Number of sections to skip (for pagination)
   * @returns Promise with array of sections
   */
  async getAllSections(activeOnly: boolean = true, limit: number = 100, skip: number = 0): Promise<ISectionBasicInfo[]> {
    try {
      const query = activeOnly ? { isActive: true } : {};
      
      return await SectionBasicInfoModel.find(query)
        .populate('subSections')
        .sort({ order: 1, section_name: 1 })
        .limit(limit)
        .skip(skip);
    } catch (error) {
      throw AppError.badRequest('Failed to retrieve sections', error);
    }
  }

  /**
   * Get section by ID
   * @param id The section ID
   * @param populateSubSections Whether to populate the subSections field
   * @returns Promise with the section object if found
   */
  async getSectionById(id: string, populateSubSections: boolean = true): Promise<ISectionBasicInfo> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw AppError.validation('Invalid section ID format');
      }

      const query = SectionBasicInfoModel.findById(id);
      
      if (populateSubSections) {
        query.populate('subSections');
      }
      
      const section = await query.exec();
      
      if (!section) {
        throw AppError.notFound(`Section with ID ${id} not found`);
      }
      
      return section;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.badRequest('Failed to retrieve section', error);
    }
  }

  /**
   * Update section by ID
   * @param id The section ID
   * @param updateData The data to update
   * @returns Promise with the updated section
   */
  async updateSectionById(id: string, updateData: Partial<ISectionBasicInfo>): Promise<ISectionBasicInfo> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw AppError.validation('Invalid section ID format');
      }
      
      // Check for duplicate section name
      if (updateData.section_name) {
        const conflict = await SectionBasicInfoModel.findOne({
          _id: { $ne: id },
          section_name: updateData.section_name
        });
        
        if (conflict) {
          throw AppError.badRequest(`Section '${updateData.section_name}' already exists`);
        }
      }
      
      const section = await SectionBasicInfoModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate('subSections');
      
      if (!section) {
        throw AppError.notFound(`Section with ID ${id} not found`);
      }
      
      return section;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.badRequest('Failed to update section', error);
    }
  }

  /**
   * Update only the isActive status of a section
   * @param id The section ID
   * @param isActive The new isActive status
   * @returns Promise with the updated section
   */
  async updateSectionActiveStatus(id: string, isActive: boolean): Promise<ISectionBasicInfo> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw AppError.validation('Invalid section ID format');
      }
      
      const section = await SectionBasicInfoModel.findByIdAndUpdate(
        id,
        { $set: { isActive } },
        { new: true, runValidators: true }
      ).populate('subSections');
      
      if (!section) {
        throw AppError.notFound(`Section with ID ${id} not found`);
      }
      
      return section;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.badRequest('Failed to update section active status', error);
    }
  }

  /**
   * Delete section by ID
   * @param id The section ID
   * @param hardDelete Whether to permanently delete (true) or just deactivate (false)
   * @returns Promise with the result of the deletion
   */
  async deleteSectionById(id: string, hardDelete: boolean = false): Promise<{ success: boolean; message: string }> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw AppError.validation('Invalid section ID format');
      }
      
      const section = await SectionBasicInfoModel.findById(id);
      
      if (!section) {
        throw AppError.notFound(`Section with ID ${id} not found`);
      }
      
      if (hardDelete) {
        await SectionBasicInfoModel.findByIdAndDelete(id);
        return { success: true, message: `Section '${section.section_name}' deleted permanently` };
      } else {
        section.isActive = false;
        await section.save();
        return { success: true, message: `Section '${section.section_name}' deactivated successfully` };
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.badRequest('Failed to delete/deactivate section', error);
    }
  }

  /**
   * Add a subSection to a section
   * @param sectionId The section ID
   * @param subSectionId The subSection ID to add
   * @returns Promise with the updated section
   */
  async addSubSection(sectionId: string, subSectionId: string): Promise<ISectionBasicInfo> {
    try {
      if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        throw AppError.validation('Invalid section ID format');
      }
      
      if (!mongoose.Types.ObjectId.isValid(subSectionId)) {
        throw AppError.validation('Invalid subSection ID format');
      }
      
      const section = await SectionBasicInfoModel.findByIdAndUpdate(
        sectionId,
        { $addToSet: { subSections: subSectionId } },
        { new: true }
      ).populate('subSections');
      
      if (!section) {
        throw AppError.notFound(`Section with ID ${sectionId} not found`);
      }
      
      return section;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.badRequest('Failed to add subSection to section', error);
    }
  }

  /**
   * Remove a subSection from a section
   * @param sectionId The section ID
   * @param subSectionId The subSection ID to remove
   * @returns Promise with the updated section
   */
  async removeSubSection(sectionId: string, subSectionId: string): Promise<ISectionBasicInfo> {
    try {
      if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        throw AppError.validation('Invalid section ID format');
      }
      
      if (!mongoose.Types.ObjectId.isValid(subSectionId)) {
        throw AppError.validation('Invalid subSection ID format');
      }
      
      const section = await SectionBasicInfoModel.findByIdAndUpdate(
        sectionId,
        { $pull: { subSections: subSectionId } },
        { new: true }
      ).populate('subSections');
      
      if (!section) {
        throw AppError.notFound(`Section with ID ${sectionId} not found`);
      }
      
      return section;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.badRequest('Failed to remove subSection from section', error);
    }
  }
}

export default new SectionService();