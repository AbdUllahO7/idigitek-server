import { Document, Schema } from 'mongoose';
import { ISectionBasicInfo } from './sectionBasicInfo.types';



export interface ICreateSubSection {
  name: string;
  description?: string;
  slug: string;
  image?: string;
  isActive?: boolean;
  order?: number;
  sectionItem?: Schema.Types.ObjectId | string;
  languages?: Schema.Types.ObjectId[] | string[];
  metadata?: any;
  isMain?: boolean;
}

export interface ICreateSubSection {
  name: string;
  description?: string;
  slug: string;
  isActive?: boolean;
  order?: number;
  sectionItem?: Schema.Types.ObjectId | string;
  languages?: Schema.Types.ObjectId[] | string[];
  metadata?: any;
}

export interface IUpdateSubSection {
  name?: string;
  description?: string;
  slug?: string;
  isActive?: boolean;
  order?: number;
  sectionItem?: Schema.Types.ObjectId | string;
  languages?: Schema.Types.ObjectId[] | string[];
  metadata?: any;
}