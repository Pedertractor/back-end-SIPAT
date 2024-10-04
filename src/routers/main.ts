import express from 'express';
import { registerRouter } from './register';
import { collaboratorRouter } from './collaborator';
import { staffRouter } from './staff';
import { routerData } from './data';

export const mainRouter = express.Router();

mainRouter.use('/register', registerRouter);
mainRouter.use('/collaborator', collaboratorRouter);
mainRouter.use('/staff', staffRouter);
mainRouter.use('/data', routerData);
