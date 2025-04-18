// ContentTranslation.ts
import mongoose, { Schema } from 'mongoose';

interface IContentTranslation {
  elementId: mongoose.Types.ObjectId;
  languageId: mongoose.Types.ObjectId;
  value: string | string[] | object;
  createdAt: Date;
  updatedAt: Date;
}

const contentTranslationSchema = new Schema<IContentTranslation>(
  {
    elementId: {
      type: Schema.Types.ObjectId,
      ref: 'ContentElement',
      required: true,
    },
    languageId: {
      type: Schema.Types.ObjectId,
      ref: 'Language',
      required: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

// Create compound index to ensure unique translation per language and element
contentTranslationSchema.index({ elementId: 1, languageId: 1 }, { unique: true });

const ContentTranslationModel = mongoose.model<IContentTranslation>('ContentTranslation', contentTranslationSchema);
export default ContentTranslationModel;