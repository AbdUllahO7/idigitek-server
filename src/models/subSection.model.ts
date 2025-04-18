import mongoose, { Schema } from 'mongoose';

interface ISubSection {
  name: string;
  description: string;
  sectionId: mongoose.Types.ObjectId;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

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
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
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

const SubSectionModel = mongoose.model<ISubSection>('SubSection', subSectionSchema);
export default SubSectionModel;