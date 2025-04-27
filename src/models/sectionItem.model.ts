import mongoose, { Schema } from "mongoose";
import { IServiceDocument } from "../types/sectionItem.types";

const sectionItemSchema = new Schema<IServiceDocument>(
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
      default: ''
    },
    image: {
      type: String,
      default: null
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
    section: {
      type: Schema.Types.ObjectId,
      ref: 'Sections',
      required: true
    },
    // Optional reference to subsections that belong to this section item
    subsections: [{
      type: Schema.Types.ObjectId,
      ref: 'SubSections'
    }]
  },
  {
    timestamps: true,
  }
);

const SectionItemModel = mongoose.model<IServiceDocument>('SectionItems', sectionItemSchema);
export default SectionItemModel;