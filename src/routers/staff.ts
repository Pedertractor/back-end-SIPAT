import express from 'express';
import {
  deleteVote,
  forVoting,
  likeOrDeslike,
  loginStaff,
  mostRegisterVote,
  revalidLoginStaff,
  showVotesByUser,
  voteStaff,
} from '../controllers/staff';
import { checkStaff } from '../middleware/check-staff';

export const staffRouter = express.Router();

staffRouter.post('/login', loginStaff);
staffRouter.post('/vote', checkStaff, voteStaff);
staffRouter.get('/mostvote', checkStaff, mostRegisterVote);
staffRouter.get('/forvoting', checkStaff, forVoting);
staffRouter.get('/byuservotes', checkStaff, showVotesByUser);
staffRouter.delete('/deletevote/:idvote', checkStaff, deleteVote);
staffRouter.post('/validlogin', revalidLoginStaff);
staffRouter.put('/vote/update/:idvote', checkStaff, likeOrDeslike);
