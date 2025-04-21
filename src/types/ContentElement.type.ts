import { Document, Schema } from 'mongoose';

export type ContentElementType = 'text' | 'heading' | 'paragraph' | 'list' | 'image' | 'video' | 'link' | 'custom';

export interface IContentElement extends Document {
  name: string;
  type: ContentElementType;
  defaultContent?: string;
  isActive: boolean;
  metadata?: any;
  order: number;
  parent: Schema.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateContentElement {
  name: string;
  type: ContentElementType;
  defaultContent?: string;
  isActive?: boolean;
  metadata?: any;
  order?: number;
  parent: Schema.Types.ObjectId | string;
}

export interface IUpdateContentElement {
  name?: string;
  type?: ContentElementType;
  defaultContent?: string;
  isActive?: boolean;
  metadata?: any;
  order?: number;
  parent?: Schema.Types.ObjectId | string;
}