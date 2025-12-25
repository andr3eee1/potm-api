import { Router } from 'express';
import { createTournament, getUsers, updateUser } from '../controllers/admin.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';

const router = Router();

router.use(authenticateToken);
router.use(isAdmin);

router.post('/tournaments', createTournament);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);

export default router;
