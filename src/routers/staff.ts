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
import { checkRole } from '../middleware/checkcollaboratorauth';

export const staffRouter = express.Router();

staffRouter.post('/login', loginStaff);
staffRouter.post('/vote', checkRole, checkStaff, voteStaff);
staffRouter.get('/mostvote', checkRole, checkStaff, mostRegisterVote);
staffRouter.get('/forvoting', checkRole, checkStaff, forVoting);
staffRouter.get('/byuservotes', checkRole, checkStaff, showVotesByUser);
staffRouter.delete('/deletevote/:idvote', checkRole, checkStaff, deleteVote);
staffRouter.post('/validlogin', revalidLoginStaff);
staffRouter.put('/vote/update/:idvote', checkRole, checkStaff, likeOrDeslike);
