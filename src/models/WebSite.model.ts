// Update ContentElementModel.ts
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
    job: {
        type: String,
    },
    },
    {   
    timestamps: true,
    }
);

const WebSiteModel = mongoose.model<WebSiteProps>('WebSite', WebSiteSchema);

export default WebSiteModel;