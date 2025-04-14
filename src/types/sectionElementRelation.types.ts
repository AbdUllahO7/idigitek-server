import { Document, Schema } from 'mongoose';
import { ISectionElement } from './SectionElement.types';
import { ISectionBasicInfo } from './sectionBasicInfo.types';
import { ISubSection } from './sub.section.types';

export interface ISectionElementRelation extends Document {
  element: Schema.Types.ObjectId | ISectionElement;
  parentType: 'section' | 'subsection';
  parent: Schema.Types.ObjectId | ISectionBasicInfo | ISubSection;
  order: number;
  isActive: boolean;
  config?: any;
  createdAt: Date;
  updatedAt: Date;
}