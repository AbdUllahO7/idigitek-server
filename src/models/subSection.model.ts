import mongoose, { Schema } from 'mongoose';
import { ISubSection } from '../types/sub.section.types';

const subSectionSchema = new Schema<ISubSection>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    // Parent sections that contain this subsection
    parentSections: [{
      type: Schema.Types.ObjectId,
      ref: 'Sections'
    }],
    // Languages associated with this subsection
    languages: [{
      type: Schema.Types.ObjectId,
      ref: 'Languages'
    }],
    // Metadata for additional configuration
    metadata: {
      type: Schema.Types.Mixed,
    }
  },
  {
    timestamps: true,
  }
);

const SubSectionModel = mongoose.model<ISubSection>('SubSection', subSectionSchema);

export default SubSectionModel;