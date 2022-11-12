import { Request as ExpressRequest } from 'express';
import { UserResult } from './auth/auth.service';

export interface Request extends ExpressRequest {
  user: UserResult | undefined;
}

export interface AuthenticatedRequest extends ExpressRequest {
  user: UserResult;
}
