import { Request } from 'express';

export interface TypeRequestUser extends Request {
  collaboratorId?: number;
}
