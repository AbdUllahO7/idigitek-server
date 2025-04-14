import mongoose, { Schema } from 'mongoose';
import { ISectionElement } from '../types/SectionElement.types';

const sectionElementSchema = new Schema<ISectionElement>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'icon', 'gallery', 'video', 'link', 'custom'],
      required: true,
      index: true,
    },
    text: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    icon: [{
      type: String,
      trim: true,
    }],
    images: [{
      type: String,
      trim: true,
    }],
    url: {
      type: String,
      trim: true,
    },
    customData: {
      type: Schema.Types.Mixed
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

const SectionElementModel = mongoose.model<ISectionElement>('SectionElement', sectionElementSchema);

export default SectionElementModel;