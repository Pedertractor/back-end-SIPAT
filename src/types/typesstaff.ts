import { Request } from 'express';

export interface TypeRequestUser extends Request {
  collaboratorId?: number;
  sector?: string;
  leader?: string;
  name?: string;
  card?: string;
}
