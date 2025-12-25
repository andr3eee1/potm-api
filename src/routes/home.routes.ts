import { Router } from 'express';
import { getDashboardStats } from '../controllers/home.controller';

const router = Router();

router.get('/stats', getDashboardStats);

export default router;
