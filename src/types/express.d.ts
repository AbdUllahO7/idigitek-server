import { IUser, UserRole } from './user.types';

// Extend Express Request interface to include user and auth info
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
      startTime?: number;
    }
  }
}

// This export is needed to make this a module
export {};