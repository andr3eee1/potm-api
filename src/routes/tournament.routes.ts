import { Router } from 'express';
import { createTournament, getAllTournaments, getTournamentById, updateTournament, submitSolution, getSubmissions, gradeSubmission } from '../controllers/tournament.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { isEditor } from '../middleware/admin.middleware';

const router = Router();

router.get('/', getAllTournaments);
router.get('/:id', getTournamentById);

router.post('/', authenticateToken, createTournament);
router.put('/:id', authenticateToken, updateTournament);

router.post('/:id/submit', authenticateToken, submitSolution);
router.get('/:id/submissions', authenticateToken, getSubmissions);
router.put('/:id/submissions/:submissionId', authenticateToken, gradeSubmission);

export default router;
