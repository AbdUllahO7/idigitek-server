import { Document, Schema } from 'mongoose';
import { ISectionBasicInfo } from './sectionBasicInfo.types';

export interface ISubSection extends Document {
  name: string;
  description?: string;
  slug: string;
  isActive: boolean;
  order: number;
  parentSections: Schema.Types.ObjectId[] | ISectionBasicInfo[];
  languages: Schema.Types.ObjectId[];
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateSubSection {
  name: string;
  description?: string;
  slug: string;
  isActive?: boolean;
  order?: number;
  parentSections?: Schema.Types.ObjectId[] | string[];
  languages?: Schema.Types.ObjectId[] | string[];
  metadata?: any;
}

export interface IUpdateSubSection {
  name?: string;
  description?: string;
  slug?: string;
  isActive?: boolean;
  order?: number;
  parentSections?: Schema.Types.ObjectId[] | string[];
  languages?: Schema.Types.ObjectId[] | string[];
  metadata?: any;
}