
// ContentElement.ts
import mongoose, { Schema } from 'mongoose';

interface IContentElement {
  key: string;
  type: 'text' | 'image' | 'icon' | 'gallery' | 'video' | 'link' | 'custom';
  parentType: 'section' | 'subsection';
  parentId: mongoose.Types.ObjectId;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const contentElementSchema = new Schema<IContentElement>(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'icon', 'gallery', 'video', 'link', 'custom'],
      required: true,
    },
    parentType: {
      type: String,
      enum: ['section', 'subsection'],
      required: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'parentType',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

const ContentElementModel = mongoose.model<IContentElement>('ContentElement', contentElementSchema);
export default ContentElementModel;
