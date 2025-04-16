import mongoose, { Schema } from 'mongoose';
import { ILanguages } from '../types/languages.types';

const languagesSchema = new Schema<ILanguages>(
    {
        language: {
            type: String,
            required: true,
            unique: true,
            lowercase: false,
            trim: true,
            index: true,
        },
        languageID: {
            type: String,
            required: true,
            unique: true,
            lowercase: false,
            trim: true,
            index: true,
        },
        isActive : {
            type : Boolean,
            default : false

        },
        subSections: [{
            type: Schema.Types.ObjectId,
            ref: 'SubSection' // Reference to the SubSection model
        }]
        },
        {
        timestamps: true,
        }
    );
    
  // Fixed the variable naming conflict (schema vs model)
const LanguagesModel = mongoose.model<ILanguages>('Languages', languagesSchema);

export default LanguagesModel;