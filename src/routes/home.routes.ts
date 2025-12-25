import { Router } from 'express';
import { getDashboardStats, getLeaderboard } from '../controllers/home.controller';

const router = Router();

router.get('/stats', getDashboardStats);
router.get('/leaderboard', getLeaderboard);

export default router;
