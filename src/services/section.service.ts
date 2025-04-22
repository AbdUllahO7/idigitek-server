import mongoose from 'mongoose';
import ContentElementModel from '../models/ContentElement.model';
import ContentTranslationModel from '../models/ContentTranslation.model';
import SectionModel from '../models/sections.model';
import SubSectionModel from '../models/subSection.model';

export class SectionService {
  // Create a new section
  async createSection(sectionData: {
    name: string; // Changed from 'name' to 'name'
    description?: string;
    image?: string;
    isActive?: boolean;
    order?: number;
  }) {
    try {
      // Ensure name is not null, undefined, or empty string
      if (!sectionData.name || sectionData.name.trim() === '') {
        throw new Error('Section name is required and cannot be empty');
      }
      
      // Check if section with the same name already exists
      const existingSection = await SectionModel.findOne({ 
        name: sectionData.name 
      });
      
      if (existingSection) {
        throw new Error(`Section with name "${sectionData.name}" already exists`);
      }
      
      const section = new SectionModel(sectionData);
      await section.save();
      return section;
    } catch (error: any) {
      // If this is a duplicate key error, provide a clearer message
      if (error.name === 'MongoServerError' && error.code === 11000) {
        throw new Error(`Section with name "${sectionData.name}" already exists`);
      }
      throw error;
    }
  }

  // Get all sections
  async getAllSections(query: any = {}) {
    try {
      const sections = await SectionModel.find(query).sort({ order: 1 });
      return sections;
    } catch (error) {
      throw error;
    }
  }

  // Get section by ID
  async getSectionById(id: string) {
    try {
      const section = await SectionModel.findById(id);
      if (!section) {
        throw new Error('Section not found');
      }
      return section;
    } catch (error) {
      throw error;
    }
  }

  // Update section
  async updateSection(id: string, updateData: any) {
    try {
      // If name is being updated, ensure it's not null, undefined, or empty
      if (updateData.name !== undefined) {
        if (!updateData.name || updateData.name.trim() === '') {
          throw new Error('Section name cannot be empty');
        }
        
        // Check if another section with the same name already exists (except this one)
        const existingSection = await SectionModel.findOne({ 
          name: updateData.name,
          _id: { $ne: id } // Exclude current section from check
        });
        
        if (existingSection) {
          throw new Error(`Another section with name "${updateData.name}" already exists`);
        }
      }
      
      const section = await SectionModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      if (!section) {
        throw new Error('Section not found');
      }
      return section;
    } catch (error: any) {
      // If this is a duplicate key error, provide a clearer message
      if (error.name === 'MongoServerError' && error.code === 11000) {
        throw new Error(`Another section with the same name already exists`);
      }
      throw error;
    }
  }

  // Update section status
  async updateSectionStatus(id: string, isActive: boolean) {
    try {
      const section = await SectionModel.findByIdAndUpdate(
        id,
        { isActive },
        { new: true, runValidators: true }
      );
      
      if (!section) {
        throw new Error('Section not found');
      }
      
      return section;
    } catch (error) {
      throw error;
    }
  }

  // Delete section
  async deleteSection(id: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Delete the section
      const section = await SectionModel.findByIdAndDelete(id).session(session);
      if (!section) {
        throw new Error('Section not found');
      }
      
      // Find all subsections belonging to this section
      const subsections = await SubSectionModel.find({ sectionId: id }).session(session);
      const subsectionIds = subsections.map(subsection => subsection._id);
      
      // Delete all subsections
      await SubSectionModel.deleteMany({ sectionId: id }).session(session);
      
      // Find all content elements for this section and its subsections
      const elementIds = await ContentElementModel.find({
        $or: [
          { parentType: 'section', parentId: id },
          { parentType: 'subsection', parentId: { $in: subsectionIds } }
        ]
      }).distinct('_id').session(session);
      
      // Delete all content elements
      await ContentElementModel.deleteMany({
        $or: [
          { parentType: 'section', parentId: id },
          { parentType: 'subsection', parentId: { $in: subsectionIds } }
        ]
      }).session(session);
      
      // Delete all content translations
      await ContentTranslationModel.deleteMany({
        elementId: { $in: elementIds }
      }).session(session);
      
      await session.commitTransaction();
      return { message: 'Section deleted successfully' };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Get section with all related content (subsections and content elements)
  async getSectionWithContent(id: string, languageId: string) {
    try {
      const section = await SectionModel.findById(id);
      if (!section) {
        throw new Error('Section not found');
      }
      
      // Get all subsections for this section
      const subsections = await SubSectionModel.find({ sectionId: id }).sort({ order: 1 });
      
      // Get all content elements for the section
      const sectionElements = await ContentElementModel.find({
        parentType: 'section',
        parentId: id
      }).sort({ order: 1 });
      
      // Get all content element IDs for section and subsections
      const sectionElementIds = sectionElements.map(el => el._id);
      const subsectionIds = subsections.map(sub => sub._id);
      
      // Get all content elements for the subsections
      const subsectionElements = await ContentElementModel.find({
        parentType: 'subsection',
        parentId: { $in: subsectionIds }
      }).sort({ order: 1 });
      
      const allElementIds = [...sectionElementIds, ...subsectionElements.map(el => el._id)];
      
      // Get all translations for the content elements
      const translations = await ContentTranslationModel.find({
        elementId: { $in: allElementIds },
        languageId
      });
      
      // Map translations to their elements
      const translationsMap = translations.reduce((map, trans) => {
        map[trans.elementId.toString()] = trans.value;
        return map;
      }, {} as Record<string, any>);
      
      // Add translations to section elements
      const sectionElementsWithTranslations = sectionElements.map(element => ({
        ...element.toObject(),
        value: translationsMap[element._id.toString()] || null
      }));
      
      // Process subsections with their elements and translations
      const subsectionsWithContent = await Promise.all(subsections.map(async (subsection) => {
        const subsectionElementsForThisSubsection = subsectionElements.filter(
          el => el.parentId.toString() === subsection._id.toString()
        );
        
        const elementsWithTranslations = subsectionElementsForThisSubsection.map(element => ({
          ...element.toObject(),
          value: translationsMap[element._id.toString()] || null
        }));
        
        return {
          ...subsection.toObject(),
          elements: elementsWithTranslations
        };
      }));
      
      return {
        ...section.toObject(),
        elements: sectionElementsWithTranslations,
        subsections: subsectionsWithContent
      };
    } catch (error) {
      throw error;
    }
  }
}