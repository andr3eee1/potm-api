import { Router } from 'express';
import { getAllTournaments } from '../controllers/tournament.controller';

const router = Router();

router.get('/', getAllTournaments);

export default router;
