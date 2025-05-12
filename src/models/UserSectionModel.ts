import mongoose, { Schema } from 'mongoose';

interface IUserSection {
  userId: Schema.Types.ObjectId;
  sectionId: Schema.Types.ObjectId;
  status: boolean; // True for active, false for inactive
  createdAt: Date;
  updatedAt: Date;
}

const userSectionSchema = new Schema<IUserSection>(
    {
        userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        },
        sectionId: {
        type: Schema.Types.ObjectId,
        ref: 'Sections',
        required: true,
        },
        status: {
        type: Boolean,
        default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Create a compound index to ensure unique pairs of userId and sectionId
userSectionSchema.index({ userId: 1, sectionId: 1 }, { unique: true });

const UserSectionModel = mongoose.model<IUserSection>('UserSectionModel', userSectionSchema);
export default UserSectionModel;