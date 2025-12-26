import { Router } from 'express';
import { createTournament, getAllTournaments, getTournamentById, updateTournament } from '../controllers/tournament.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { isEditor } from '../middleware/admin.middleware';

const router = Router();

router.get('/', getAllTournaments);
router.get('/:id', getTournamentById);

router.post('/', authenticateToken, isEditor, createTournament);
router.put('/:id', authenticateToken, isEditor, updateTournament);

export default router;
