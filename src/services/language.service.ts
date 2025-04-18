// services/LanguageService.ts

import LanguageModel from "../models/languages.model";

export class LanguageService {
  // Create a new language
  async createLanguage(languageData: {
    name: string;
    code: string;
    isActive?: boolean;
  }) {
    try {
      const language = new LanguageModel(languageData);
      await language.save();
      return language;
    } catch (error) {
      throw error;
    }
  }

  // Get all languages
  async getAllLanguages(query: any = {}) {
    try {
      const languages = await LanguageModel.find(query);
      return languages;
    } catch (error) {
      throw error;
    }
  }

  // Get language by ID
  async getLanguageById(id: string) {
    try {
      const language = await LanguageModel.findById(id);
      if (!language) {
        throw new Error('Language not found');
      }
      return language;
    } catch (error) {
      throw error;
    }
  }

  // Update language
  async updateLanguage(id: string, updateData: any) {
    try {
      const language = await LanguageModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      if (!language) {
        throw new Error('Language not found');
      }
      return language;
    } catch (error) {
      throw error;
    }
  }

  // Delete language
  async deleteLanguage(id: string) {
    try {
      const language = await LanguageModel.findByIdAndDelete(id);
      if (!language) {
        throw new Error('Language not found');
      }
      return { message: 'Language deleted successfully' };
    } catch (error) {
      throw error;
    }
  }
}
