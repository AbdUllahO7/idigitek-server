import { Schema, Document, Types } from 'mongoose';

export interface IService {
  _id?: string | Types.ObjectId;
  name: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  order?: number;
  subsections: Schema.Types.ObjectId | string;
  createdAt?: Date;
  updatedAt?: Date;
  section: Schema.Types.ObjectId | string;
  isMain?: boolean;
}

export interface IServiceDocument extends Document, Omit<IService, '_id'> {
  _id: Types.ObjectId;
}

export interface IUpdateSectionItem {
  name?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  order?: number;
  subsections?: Schema.Types.ObjectId | string;
  section: Schema.Types.ObjectId | string;
  isMain?: boolean;

}