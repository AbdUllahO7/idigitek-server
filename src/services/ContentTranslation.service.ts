// services/ContentTranslationService.ts

import mongoose from 'mongoose';
import ContentElementModel from '../models/ContentElement.model';
import ContentTranslationModel from '../models/ContentTranslation.model';
import LanguageModel from '../models/languages.model';

export class ContentTranslationService {
  // Create or update translation
  async createOrUpdateTranslation(translationData: {
    elementId: string;
    languageId: string;
    value: any;
  }) {
    try {
      // Verify element exists
      const element = await ContentElementModel.findById(translationData.elementId);
      if (!element) {
        throw new Error('Content element not found');
      }
      
      // Verify language exists
      const language = await LanguageModel.findById(translationData.languageId);
      if (!language) {
        throw new Error('Language not found');
      }
      
      // Check if translation already exists
      const existingTranslation = await ContentTranslationModel.findOne({
        elementId: translationData.elementId,
        languageId: translationData.languageId
      });
      
      if (existingTranslation) {
        // Update existing translation
        existingTranslation.value = translationData.value;
        await existingTranslation.save();
        return existingTranslation;
      } else {
        // Create new translation
        const translation = new ContentTranslationModel(translationData);
        await translation.save();
        return translation;
      }
    } catch (error) {
      throw error;
    }
  }

  // Get translation by element ID and language ID
  async getTranslation(elementId: string, languageId: string) {
    try {
      const translation = await ContentTranslationModel.findOne({
        elementId,
        languageId
      });
      return translation;
    } catch (error) {
      throw error;
    }
  }

  // Get all translations for an element
  async getAllTranslationsForElement(elementId: string) {
    try {
      const translations = await ContentTranslationModel.find({ elementId })
        .populate('languageId', 'name code');
      return translations;
    } catch (error) {
      throw error;
    }
  }

  // Delete translation
  async deleteTranslation(id: string) {
    try {
      const translation = await ContentTranslationModel.findByIdAndDelete(id);
      if (!translation) {
        throw new Error('Translation not found');
      }
      return { message: 'Translation deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Bulk create or update translations
  async bulkCreateOrUpdateTranslations(translations: Array<{
    elementId: string;
    languageId: string;
    value: any;
  }>) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const results = [];
      
      for (const translation of translations) {
        // Check if translation already exists
        const existingTranslation = await ContentTranslationModel.findOne({
          elementId: translation.elementId,
          languageId: translation.languageId
        }).session(session);
        
        if (existingTranslation) {
          // Update existing translation
          existingTranslation.value = translation.value;
          await existingTranslation.save({ session });
          results.push(existingTranslation);
        } else {
          // Create new translation
          const newTranslation = new ContentTranslationModel(translation);
          await newTranslation.save({ session });
          results.push(newTranslation);
        }
      }
      
      await session.commitTransaction();
      return results;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}