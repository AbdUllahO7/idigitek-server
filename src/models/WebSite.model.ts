// WebSiteModel.ts
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

WebSiteSchema.virtual('languages', {
    ref: 'Languages',
    localField: '_id',
    foreignField: 'website'
});

const WebSiteModel = mongoose.model<WebSiteProps>('WebSite', WebSiteSchema);

export default WebSiteModel;