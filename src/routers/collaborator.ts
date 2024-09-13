import express from 'express';
import { checkCollaborator } from '../controllers/collaborator';

export const collaboratorRouter = express.Router();

collaboratorRouter.post('/check', checkCollaborator);
