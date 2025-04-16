import { Document, Types } from 'mongoose';

/**
 * Interface for Language document
 * Extends Mongoose Document to include _id and other Mongoose properties
 */
export interface ILanguages extends Document {
  /**
   * The language name (e.g., "English", "Spanish")
   */
  language: string;
  
  /**
   * The language code/ID (e.g., "en", "es")
   */
  languageID: string;
  
  /**
   * References to SubSection documents
   */
  subSections: Types.ObjectId[] | string[];
  
  /**
   * Creation timestamp
   */
  createdAt: Date;
  
  /**
   * Last updated timestamp
   */
  updatedAt: Date;
}

/**
 * Interface for creating a new language
 * Omits the document specific fields
 */
export interface ICreateLanguage {
  language: string;
  languageID: string;
  subSections?: Types.ObjectId[] | string[];
}

/**
 * Interface for updating a language
 * Makes all fields optional
 */
export interface IUpdateLanguage {
  language?: string;
  languageID?: string;
  subSections?: Types.ObjectId[] | string[];
}

/**
 * Type for language response
 * Used for API responses to clients
 */
export interface ILanguageResponse {
  _id: string;
  language: string;
  languageID: string;
  subSections: any[]; // Can be populated or not
  createdAt: string;
  updatedAt: string;
}

/**
 * Type for operation result
 */
export interface IOperationResult {
  success: boolean;
  message: string;
  data?: any;
}