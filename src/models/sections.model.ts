import { required } from "joi";
import mongoose, { Schema } from "mongoose";

interface ISection {
  name: string;
  description: string;
  image: string;
  isActive: boolean;
  order: number;
  WebSiteId : Schema.Types.ObjectId,
  sectionItems: Schema.Types.ObjectId[]; // Added reference to section items
  createdAt: Date;
  updatedAt: Date;

}

const sectionSchema = new Schema<ISection>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    image:{
      type: String,
      default: null
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    sectionItems: [{
      type: Schema.Types.ObjectId,
      ref: 'SectionItems'
    }],
    WebSiteId : {
      type: Schema.Types.ObjectId,
      ref: 'WebSite',
      required : true 
    }
  },
  {
    timestamps: true,
  }
);

const SectionModel = mongoose.model<ISection>('Sections', sectionSchema);
export default SectionModel;