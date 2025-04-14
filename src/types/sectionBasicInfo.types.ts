import { Document, Schema } from 'mongoose';
import { ISubSection } from './sub.section.types';

export interface ISectionBasicInfo extends Document {
    section_name: string;
    description?: string;
    isActive: boolean;
    order: number;
    subSections: Schema.Types.ObjectId[] | ISubSection[];
    createdAt: Date;
    updatedAt: Date;
  }
  