import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { IUser, UserRole, UserStatus } from '../types/user.types';
import { env } from '../config/env';
import SectionModel from './sections.model';
import UserSectionModel from './UserSectionModel';

const jwt = require('jsonwebtoken');

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    refreshToken: {
      type: String,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpires: {
      type: Date,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lastFailedLogin: {
      type: Date,
    },
    lockUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash the password before saving
userSchema.pre('save', async function (next) {
  const user = this;
  
  // Only hash the password if it has been modified or is new
  if (!user.isModified('password')) return next();
  
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(env.security.bcryptSaltRounds);
    
    // Hash the password along with the new salt
    const hash = await bcrypt.hash(user.password, salt);
    
    // Override the plaintext password with the hashed one
    user.password = hash;
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};

// Check if account is locked
userSchema.methods.isAccountLocked = function (): boolean {
  // Check if account is locked and lock time has not expired
  return !!(
    this.lockUntil && 
    new Date(this.lockUntil) > new Date()
  );
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function (): string {
  // Use as string to ensure TypeScript recognizes the type correctly
  const secret = env.jwt.secret as string;
  
  const refreshToken = jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
    },
    secret,
    {
      // expiresIn: env.jwt.refreshExpiration,
    }
  );
  
  this.refreshToken = refreshToken;
  return refreshToken;
};

// Generate email verification token
userSchema.methods.generateVerificationToken = function (): string {
  const token = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
    
  this.emailVerificationExpires = new Date(
    Date.now() + 24 * 60 * 60 * 1000
  ); // 24 hours
  
  return token;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function (): string {
  const token = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
    
  this.passwordResetExpires = new Date(
    Date.now() + 10 * 60 * 1000
  ); // 10 minutes
  
  return token;
};

// Create a compound index on email and status
userSchema.index({ email: 1, status: 1 });

// Get active sections for a user
userSchema.methods.getActiveSections = async function () {
  const userSections = await UserSectionModel.find({ 
    userId: this._id,
    status: true
  }).populate('sectionId');
  
  return userSections.map(userSection => userSection.sectionId);
};

// Activate a section for a user
userSchema.methods.activateSection = async function (sectionId: Schema.Types.ObjectId) {
  try {
    // First check if the section exists
    const section = await SectionModel.findById(sectionId);
    if (!section) {
      throw new Error('Section not found');
    }
    
    // Check if the relationship already exists
    const existingRelation = await UserSectionModel.findOne({
      userId: this._id,
      sectionId
    });
    
    if (existingRelation) {
      // If relationship exists but is inactive, update it
      if (!existingRelation.status) {
        existingRelation.status = true;
        await existingRelation.save();
        return existingRelation;
      }
      // Relationship already exists and is active
      return existingRelation;
    }
    
    // Create new relationship
    const userSection = new UserSectionModel({
      userId: this._id,
      sectionId,
      status: true
    });
    
    await userSection.save();
    return userSection;
  } catch (error) {
    throw error;
  }
};

// Deactivate a section for a user
userSchema.methods.deactivateSection = async function (sectionId: Schema.Types.ObjectId) {
  try {
    // Find the relationship
    const userSection = await UserSectionModel.findOne({
      userId: this._id,
      sectionId
    });
    
    if (!userSection) {
      throw new Error('User does not have this section activated');
    }
    
    // Update status to inactive
    userSection.status = false;
    await userSection.save();
    
    return userSection;
  } catch (error) {
    throw error;
  }
};

// Alternative: completely remove the relationship instead of setting status to false
userSchema.methods.removeSection = async function (sectionId: Schema.Types.ObjectId) {
  try {
    const result = await UserSectionModel.findOneAndDelete({
      userId: this._id,
      sectionId
    });
    
    if (!result) {
      throw new Error('User does not have this section activated');
    }
    
    return { message: 'Section successfully removed from user' };
  } catch (error) {
    throw error;
  }
};

const UserModel = mongoose.model<IUser>('User', userSchema);

export default UserModel;