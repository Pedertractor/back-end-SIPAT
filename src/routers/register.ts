import express from 'express';
import { createNewPhrase } from '../controllers/register';
import { upload } from '../services/multer';
import { checkRole } from '../middleware/checkcollaboratorauth';

export const registerRouter = express.Router();

registerRouter.post(
  '/create',
  checkRole,
  upload.single('image'),
  createNewPhrase
);
