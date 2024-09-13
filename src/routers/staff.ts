import express from 'express';
import {
  deleteVote,
  loginStaff,
  mostRegisterVote,
  showVotesByUser,
  voteStaff,
} from '../controllers/staff';
import { checkRole } from '../middleware/checkcollaboratorauth';

export const staffRouter = express.Router();

staffRouter.post('/login', loginStaff);
staffRouter.post('/vote', checkRole, voteStaff);
staffRouter.get('/mostvote', checkRole, mostRegisterVote);
staffRouter.get('/byuservotes', checkRole, showVotesByUser);
staffRouter.delete('/deletevote/:idvote', checkRole, deleteVote);
