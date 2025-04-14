import { Document, Schema } from 'mongoose';
import { ISectionBasicInfo } from './sectionBasicInfo.types';

export interface ISubSection extends Document {
  name: string;
  description?: string;
  isActive: boolean;
  order: number;
  parentSections: Schema.Types.ObjectId[] | ISectionBasicInfo[];
  languages: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}