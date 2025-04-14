import mongoose, { Schema } from 'mongoose';
import { ISectionElementRelation } from '../types/sectionElementRelation.types';

// This is a junction table that allows elements to be linked to either sections or subsections
const sectionElementRelationSchema = new Schema<ISectionElementRelation>(
  {
    // The element that is being linked
    element: {
      type: Schema.Types.ObjectId,
      ref: 'SectionElement',
      required: true,
    },
    // The type of parent this element is linked to (either "section" or "subsection")
    parentType: {
      type: String,
      enum: ['section', 'subsection'],
      required: true,
    },
    // The ID of the parent (either a section ID or subsection ID)
    parent: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'parentType', // This is a dynamic reference based on parentType
    },
    // Position of this element within the parent
    order: {
      type: Number,
      default: 0,
    },
    // Whether this relationship is active
    isActive: {
      type: Boolean,
      default: true,
    },
    // Additional configuration for this element in this specific context
    config: {
      type: Schema.Types.Mixed,
    }
  },
  {
    timestamps: true,
  }
);

// Create compound indexes for efficient querying
sectionElementRelationSchema.index({ element: 1, parent: 1, parentType: 1 }, { unique: true });
sectionElementRelationSchema.index({ parent: 1, parentType: 1, isActive: 1 });

const SectionElementRelationModel = mongoose.model<ISectionElementRelation>(
  'SectionElementRelation',
  sectionElementRelationSchema
);

export default SectionElementRelationModel;