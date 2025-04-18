// Language.ts
import mongoose, { Schema } from 'mongoose';

interface ILanguage {
    name: string;
    code: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const languageSchema = new Schema<ILanguage>(
    {
        name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
        },
        code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
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

const LanguageModel = mongoose.model<ILanguage>('Language', languageSchema);
export default LanguageModel;