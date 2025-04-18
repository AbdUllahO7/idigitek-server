
import mongoose from 'mongoose';
import ContentElementModel from '../models/ContentElement.model';
import ContentTranslationModel from '../models/ContentTranslation.model';
import SubSectionModel from '../models/subSection.model';

export class SubSectionService {
  // Create a new subsection
  async createSubSection(subSectionData: {
    name: string;
    description?: string;
    sectionId: string;
    isActive?: boolean;
    order?: number;
  }) {
    try {
      const subsection = new SubSectionModel(subSectionData);
      await subsection.save();
      return subsection;
    } catch (error) {
      throw error;
    }
  }

  // Get all subsections, optionally filtered by sectionId
  async getAllSubSections(query: any = {}) {
    try {
      const subsections = await SubSectionModel.find(query).sort({ order: 1 });
      return subsections;
    } catch (error) {
      throw error;
    }
  }

  // Get subsection by ID
  async getSubSectionById(id: string) {
    try {
      const subsection = await SubSectionModel.findById(id);
      if (!subsection) {
        throw new Error('SubSection not found');
      }
      return subsection;
    } catch (error) {
      throw error;
    }
  }

  // Update subsection
  async updateSubSection(id: string, updateData: any) {
    try {
      const subsection = await SubSectionModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      if (!subsection) {
        throw new Error('SubSection not found');
      }
      return subsection;
    } catch (error) {
      throw error;
    }
  }

  // Delete subsection
  async deleteSubSection(id: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Delete the subsection
      const subsection = await SubSectionModel.findByIdAndDelete(id).session(session);
      if (!subsection) {
        throw new Error('SubSection not found');
      }
      
      // Find all content elements for this subsection
      const elementIds = await ContentElementModel.find({
        parentType: 'subsection',
        parentId: id
      }).distinct('_id').session(session);
      
      // Delete all content elements
      await ContentElementModel.deleteMany({
        parentType: 'subsection',
        parentId: id
      }).session(session);
      
      // Delete all content translations
      await ContentTranslationModel.deleteMany({
        elementId: { $in: elementIds }
      }).session(session);
      
      await session.commitTransaction();
      return { message: 'SubSection deleted successfully' };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Get subsection with all related content
  async getSubSectionWithContent(id: string, languageId: string) {
    try {
      const subsection = await SubSectionModel.findById(id);
      if (!subsection) {
        throw new Error('SubSection not found');
      }
      
      // Get all content elements for this subsection
      const elements = await ContentElementModel.find({
        parentType: 'subsection',
        parentId: id
      }).sort({ order: 1 });
      
      const elementIds = elements.map(el => el._id);
      
      // Get all translations for the content elements
      const translations = await ContentTranslationModel.find({
        elementId: { $in: elementIds },
        languageId
      });
      
      // Map translations to their elements
      const translationsMap = translations.reduce((map, trans) => {
        map[trans.elementId.toString()] = trans.value;
        return map;
      }, {} as Record<string, any>);
      
      // Add translations to elements
      const elementsWithTranslations = elements.map(element => ({
        ...element.toObject(),
        value: translationsMap[element._id.toString()] || null
      }));
      
      return {
        ...subsection.toObject(),
        elements: elementsWithTranslations
      };
    } catch (error) {
      throw error;
    }
  }
}