import mongoose, { Schema } from 'mongoose';
import { ICreateSubSection } from '../types/sub.section.types';

const subSectionSchema = new Schema<ICreateSubSection>(
  {
    name:{
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
    isMain: {
      type: Boolean,
      default: false,
    },
    // Reference to the section item this subsection belongs to
    sectionItem: {
      type: Schema.Types.ObjectId,
      ref: 'SectionItems',
      required: true
    },
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

const SubSectionModel = mongoose.model<ICreateSubSection>('SubSections', subSectionSchema);

export default SubSectionModel;