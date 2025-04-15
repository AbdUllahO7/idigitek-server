// src/types/express.d.ts
import { UserRole } from './user.types';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
      requestId?: string;
      startTime?: number;
    }
  }
}