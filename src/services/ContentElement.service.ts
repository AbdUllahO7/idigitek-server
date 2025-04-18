// services/ContentElementService.ts
import mongoose from 'mongoose';
import ContentElementModel from '../models/ContentElement.model';
import ContentTranslationModel from '../models/ContentTranslation.model';

export class ContentElementService {
  // Create a new content element
  async createContentElement(elementData: {
    key: string;
    type: 'text' | 'image' | 'icon' | 'gallery' | 'video' | 'link' | 'custom';
    parentType: 'section' | 'subsection';
    parentId: string;
    order?: number;
    isActive?: boolean;
  }) {
    try {
      const element = new ContentElementModel(elementData);
      await element.save();
      return element;
    } catch (error) {
      throw error;
    }
  }

  // Get all content elements
  async getAllContentElements(query: any = {}) {
    try {
      const elements = await ContentElementModel.find(query).sort({ order: 1 });
      return elements;
    } catch (error) {
      throw error;
    }
  }

  // Get content element by ID
  async getContentElementById(id: string) {
    try {
      const element = await ContentElementModel.findById(id);
      if (!element) {
        throw new Error('Content element not found');
      }
      return element;
    } catch (error) {
      throw error;
    }
  }

  // Update content element
  async updateContentElement(id: string, updateData: any) {
    try {
      const element = await ContentElementModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      if (!element) {
        throw new Error('Content element not found');
      }
      return element;
    } catch (error) {
      throw error;
    }
  }

  // Delete content element
  async deleteContentElement(id: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Delete the content element
      const element = await ContentElementModel.findByIdAndDelete(id).session(session);
      if (!element) {
        throw new Error('Content element not found');
      }
      
      // Delete all translations for this element
      await ContentTranslationModel.deleteMany({ elementId: id }).session(session);
      
      await session.commitTransaction();
      return { message: 'Content element deleted successfully' };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Get content element with translations
  async getContentElementWithTranslations(id: string) {
    try {
      const element = await ContentElementModel.findById(id);
      if (!element) {
        throw new Error('Content element not found');
      }
      
      // Get all translations for this element
      const translations = await ContentTranslationModel.find({ elementId: id })
        .populate('languageId', 'name code');
      
      return {
        ...element.toObject(),
        translations
      };
    } catch (error) {
      throw error;
    }
  }
}