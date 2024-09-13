import express from 'express';
import { createNewPhrase } from '../controllers/register';
import { upload } from '../services/multer';

export const registerRouter = express.Router();

registerRouter.post('/create', upload.single('image'), createNewPhrase);
