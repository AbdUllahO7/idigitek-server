import mongoose from 'mongoose';
import { ILanguages } from '../types/languages.types';
import { AppError } from '../middleware/errorHandler.middlerware';
import LanguagesModel from '../models/languages.model';

class LanguageService {
  /**
   * Create a new language
   * @param languageData The language data to create
   * @returns Promise with the created language
   */
  async createLanguage(languageData: Partial<ILanguages>): Promise<ILanguages> {
    try {
      // Check if language already exists with the same languageID or name
      const existingLanguage = await LanguagesModel.findOne({ 
        $or: [
          { languageID: languageData.languageID },
          { language: languageData.language }
        ] 
      });
      
      if (existingLanguage) {
        if (existingLanguage.languageID === languageData.languageID) {
          throw AppError.badRequest(`Language with ID '${languageData.languageID}' already exists`);
        } else {
          throw AppError.badRequest(`Language '${languageData.language}' already exists`);
        }
      }
      
      // Create new language
      const language = new LanguagesModel(languageData);
      return await language.save();
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.badRequest('Failed to create language', error);
    }
  }

  /**
   * Get all languages
   * @param limit Maximum number of languages to return
   * @param skip Number of languages to skip (for pagination)
   * @returns Promise with array of languages
   */
  async getAllLanguages(limit: number = 100, skip: number = 0): Promise<ILanguages[]> {
    try {
      return await LanguagesModel.find()
        .populate('subSections')
        .sort({ language: 1 })
        .limit(limit)
        .skip(skip);
    } catch (error) {
      throw AppError.badRequest('Failed to retrieve languages', error);
    }
  }

  /**
   * Get language by ID
   * @param id The language ID
   * @param populateSubSections Whether to populate the subSections field
   * @returns Promise with the language object if found
   */
  async getLanguageById(id: string, populateSubSections: boolean = true): Promise<ILanguages> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw AppError.validation('Invalid language ID format');
      }

      const query = LanguagesModel.findById(id);
      
      if (populateSubSections) {
        query.populate('subSections');
      }
      
      const language = await query.exec();
      
      if (!language) {
        throw AppError.notFound(`Language with ID ${id} not found`);
      }
      
      return language;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.badRequest('Failed to retrieve language', error);
    }
  }

  /**
   * Get language by language code (languageID)
   * @param languageID The language code
   * @param populateSubSections Whether to populate the subSections field
   * @returns Promise with the language object if found
   */
  async getLanguageByCode(languageID: string, populateSubSections: boolean = true): Promise<ILanguages> {
    try {
      const query = LanguagesModel.findOne({ languageID });
      
      if (populateSubSections) {
        query.populate('subSections');
      }
      
      const language = await query.exec();
      
      if (!language) {
        throw AppError.notFound(`Language with code ${languageID} not found`);
      }
      
      return language;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.badRequest('Failed to retrieve language', error);
    }
  }

  /**
   * Update language by ID
   * @param id The language ID
   * @param updateData The data to update
   * @returns Promise with the updated language
   */
  async updateLanguageById(id: string, updateData: Partial<ILanguages>): Promise<ILanguages> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw AppError.validation('Invalid language ID format');
      }
      
      // Check for duplicate language or language ID
      if (updateData.language || updateData.languageID) {
        const conflict = await LanguagesModel.findOne({
          _id: { $ne: id },
          $or: [
            updateData.language ? { language: updateData.language } : null,
            updateData.languageID ? { languageID: updateData.languageID } : null
          ].filter(Boolean) // Remove null entries
        });
        
        if (conflict) {
          if (conflict.language === updateData.language) {
            throw AppError.badRequest(`Language '${updateData.language}' already exists`);
          } else {
            throw AppError.badRequest(`Language ID '${updateData.languageID}' already exists`);
          }
        }
      }
      
      const language = await LanguagesModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate('subSections');
      
      if (!language) {
        throw AppError.notFound(`Language with ID ${id} not found`);
      }
      
      return language;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.badRequest('Failed to update language', error);
    }
  }

  /**
   * Delete language by ID
   * @param id The language ID
   * @returns Promise with the result of the deletion
   */
  async deleteLanguageById(id: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw AppError.validation('Invalid language ID format');
      }
      
      const language = await LanguagesModel.findByIdAndDelete(id);
      
      if (!language) {
        throw AppError.notFound(`Language with ID ${id} not found`);
      }
      
      return { success: true, message: `Language '${language.language}' deleted successfully` };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.badRequest('Failed to delete language', error);
    }
  }

  /**
   * Add a subSection to a language
   * @param languageId The language ID
   * @param subSectionId The subSection ID to add
   * @returns Promise with the updated language
   */
  async addSubSection(languageId: string, subSectionId: string): Promise<ILanguages> {
    try {
      if (!mongoose.Types.ObjectId.isValid(languageId)) {
        throw AppError.validation('Invalid language ID format');
      }
      
      if (!mongoose.Types.ObjectId.isValid(subSectionId)) {
        throw AppError.validation('Invalid subSection ID format');
      }
      
      const language = await LanguagesModel.findByIdAndUpdate(
        languageId,
        { $addToSet: { subSections: subSectionId } },
        { new: true }
      ).populate('subSections');
      
      if (!language) {
        throw AppError.notFound(`Language with ID ${languageId} not found`);
      }
      
      return language;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.badRequest('Failed to add subSection to language', error);
    }
  }

  /**
   * Remove a subSection from a language
   * @param languageId The language ID
   * @param subSectionId The subSection ID to remove
   * @returns Promise with the updated language
   */
  async removeSubSection(languageId: string, subSectionId: string): Promise<ILanguages> {
    try {
      if (!mongoose.Types.ObjectId.isValid(languageId)) {
        throw AppError.validation('Invalid language ID format');
      }
      
      if (!mongoose.Types.ObjectId.isValid(subSectionId)) {
        throw AppError.validation('Invalid subSection ID format');
      }
      
      const language = await LanguagesModel.findByIdAndUpdate(
        languageId,
        { $pull: { subSections: subSectionId } },
        { new: true }
      ).populate('subSections');
      
      if (!language) {
        throw AppError.notFound(`Language with ID ${languageId} not found`);
      }
      
      return language;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.badRequest('Failed to remove subSection from language', error);
    }
  }
}

export default new LanguageService();