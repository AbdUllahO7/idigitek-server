import mongoose, { Schema } from "mongoose";

interface ISection {
  name: string;
  description: string;
  image: string;
  isActive: boolean;
  order: number;
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
    // Added reference to section items under this section
    sectionItems: [{
      type: Schema.Types.ObjectId,
      ref: 'SectionItems'
    }]
  },
  {
    timestamps: true,
  }
);

const SectionModel = mongoose.model<ISection>('Sections', sectionSchema);
export default SectionModel;