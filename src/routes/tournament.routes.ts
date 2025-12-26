import { Router } from 'express';
import { getAllTournaments, getTournamentById } from '../controllers/tournament.controller';

const router = Router();

router.get('/', getAllTournaments);
router.get('/:id', getTournamentById);

export default router;
