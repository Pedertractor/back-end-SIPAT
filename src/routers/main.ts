import express from 'express';
import { registerRouter } from './register';
import { collaboratorRouter } from './collaborator';
import { staffRouter } from './staff';

export const mainRouter = express.Router();

mainRouter.use('/register', registerRouter);
mainRouter.use('/collaborator', collaboratorRouter);
mainRouter.use('/staff', staffRouter);
