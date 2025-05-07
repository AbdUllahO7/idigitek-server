import { Schema } from 'mongoose';

export interface WebSiteProps {
  name: string;
  description?: string;
  logo?: string;
  job?: string;
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: any;

}

export interface WebSiteUserProps {
  userId: Schema.Types.ObjectId;
  webSiteId: Schema.Types.ObjectId;
  role: 'owner' | 'editor' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
}

export interface WebSiteWithUsersProps extends WebSiteProps {
  users: {
    userId: Schema.Types.ObjectId;
    role: string;
  }[];
}