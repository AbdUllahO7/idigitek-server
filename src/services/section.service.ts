
import mongoose from 'mongoose';
import ContentElementModel from '../models/ContentElement.model';
import ContentTranslationModel from '../models/ContentTranslation.model';
import SectionModel from '../models/sectionBasicInfo.model';
import SubSectionModel from '../models/subSection.model';

export class SectionService {
  // Create a new section
  async createSection(sectionData: {
    name: string;
    description?: string;
    image?: string;
    isActive?: boolean;
    order?: number;
  }) {
    try {
      const section = new SectionModel(sectionData);
      await section.save();
      return section;
    } catch (error) {
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
      const section = await SectionModel.findByIdAndUpdate(
        id,
        updateData,
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
