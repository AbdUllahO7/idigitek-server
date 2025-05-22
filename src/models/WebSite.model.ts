import mongoose, { Schema } from 'mongoose';
import { WebSiteProps } from 'src/types/WebSite.type';

const WebSiteSchema = new Schema<WebSiteProps>(
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
        phoneNumber: {
            type: String
        },
        address: {
            type: String,
        },
        email: {
            type: String
        },
        logo: {
            type: String,
        },
        sector: {
            type: String,
        },
    },
    {   
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtual field for languages
WebSiteSchema.virtual('languages', {
    ref: 'Languages',
    localField: '_id',
    foreignField: 'websiteId'
});

// Virtual field for sections
WebSiteSchema.virtual('sections', {
    ref: 'Sections', // Match the model name defined in SectionModel
    localField: '_id',
    foreignField: 'WebSiteId' // Match the field in SectionModel
});

const WebSiteModel = mongoose.model<WebSiteProps>('WebSite', WebSiteSchema);

export default WebSiteModel;