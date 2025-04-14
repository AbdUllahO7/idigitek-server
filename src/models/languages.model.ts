import mongoose, { Schema } from 'mongoose';
import { ILanguages } from '../types/languages.types';

const languagesSchema = new Schema<ILanguages>(
    {
        language: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
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