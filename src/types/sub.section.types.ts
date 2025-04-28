import { Schema } from 'mongoose';
import { ICreateContentElement } from './ContentElement.type';



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
  elements: ICreateContentElement[];

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