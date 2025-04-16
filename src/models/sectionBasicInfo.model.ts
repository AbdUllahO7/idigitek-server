import mongoose, { Schema } from 'mongoose';
import { ISectionBasicInfo } from '../types/sectionBasicInfo.types';

const sectionBasicInfoSchema = new Schema<ISectionBasicInfo>(
  {
    section_name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: ''

    },
    image : {
      type :String,
      required : false,
      default : null
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    // Reference to subsections
    subSections: [{
      type: Schema.Types.ObjectId,
      ref: 'SubSection'
    }]
  },
  {
    timestamps: true,
  }
);

const SectionBasicInfoModel = mongoose.model<ISectionBasicInfo>('SectionBasicInfo', sectionBasicInfoSchema);

export default SectionBasicInfoModel;