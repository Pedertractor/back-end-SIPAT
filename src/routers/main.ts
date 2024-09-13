import express from 'express';
import { registerRouter } from './register';
import { collaboratorRouter } from './collaborator';

export const mainRouter = express.Router();

mainRouter.use('/register', registerRouter);
mainRouter.use('/collaborator', collaboratorRouter);
