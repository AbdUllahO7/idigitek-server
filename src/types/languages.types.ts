import { Document } from 'mongoose';

export interface ILanguages extends Document {
    language: string;
    subSections: string[]; // Array of SubSection IDs for many-to-many relationship
}