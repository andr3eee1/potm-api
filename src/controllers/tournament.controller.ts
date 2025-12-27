import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAllTournaments = async (req: Request, res: Response) => {
  try {
    const tournaments = await prisma.tournament.findMany({
      orderBy: { startDate: 'desc' }
    });

    res.json(tournaments.map(t => ({
      id: t.id.toString(),
      title: t.title,
      description: t.description,
      status: t.status === 'ACTIVE' ? 'Active' : t.status === 'UPCOMING' ? 'Upcoming' : 'Completed',
      startDate: t.startDate.toLocaleDateString(),
      endDate: t.endDate.toLocaleDateString(),
      difficulty: t.difficulty,
      color: t.status === 'ACTIVE' ? 'bg-blue-500' : 'bg-slate-500',
      prizePool: t.prizePool,
      points: t.points,
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTournamentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const tournament = await prisma.tournament.findUnique({
      where: { id: parseInt(id) }
    });

    if (!tournament) {
      res.status(404).json({ message: 'Tournament not found' });
      return;
    }

    res.json({
      id: tournament.id.toString(),
      title: tournament.title,
      description: tournament.description,
      statement: tournament.statement,
      status: tournament.status === 'ACTIVE' ? 'Active' : tournament.status === 'UPCOMING' ? 'Upcoming' : 'Completed',
      startDate: tournament.startDate.toISOString(),
      endDate: tournament.endDate.toISOString(),
      difficulty: tournament.difficulty,
      color: tournament.status === 'ACTIVE' ? 'bg-blue-500' : 'bg-slate-500',
      prizePool: tournament.prizePool,
      points: tournament.points,
      creatorId: tournament.creatorId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createTournamentSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  statement: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  prizePool: z.string().optional(),
  status: z.enum(['UPCOMING', 'ACTIVE', 'COMPLETED']).optional(),
  points: z.number().int().optional(),
  difficulty: z.string().optional(),
});

export const createTournament = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = createTournamentSchema.parse(req.body);

    if (!req.user || !req.user.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const tournament = await prisma.tournament.create({
      data: {
        title: data.title,
        description: data.description,
        statement: data.statement,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        prizePool: data.prizePool,
        status: data.status || 'UPCOMING',
        points: data.points || 100,
        difficulty: data.difficulty || 'N/A',
        creatorId: req.user.userId,
      },
    });

    res.status(201).json(tournament);
  } catch (error) {
     if (error instanceof z.ZodError) {
       res.status(400).json({ message: (error as z.ZodError).issues });
       return;
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateTournamentSchema = createTournamentSchema.partial();

export const updateTournament = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tournamentId = parseInt(req.params.id);
    const data = updateTournamentSchema.parse(req.body);

    const tournament = await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.statement && { statement: data.statement }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.prizePool && { prizePool: data.prizePool }),
        ...(data.status && { status: data.status }),
        ...(data.points && { points: data.points }),
        ...(data.difficulty && { difficulty: data.difficulty }),
      },
    });

    res.json(tournament);
  } catch (error) {
     if (error instanceof z.ZodError) {
       res.status(400).json({ message: (error as z.ZodError).issues });
       return;
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const submitSolutionSchema = z.object({
  code: z.string().min(1),
  language: z.string().optional(),
});

export const submitSolution = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tournamentId = parseInt(req.params.id);
    const userId = req.user.userId;
    const { code, language } = submitSolutionSchema.parse(req.body);

    const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
    if (!tournament) {
      res.status(404).json({ message: 'Tournament not found' });
      return;
    }
    
    if (tournament.status !== 'ACTIVE') {
       res.status(400).json({ message: 'Tournament is not active' });
       return;
    }

    const submission = await prisma.submission.create({
      data: {
        userId,
        tournamentId,
        code,
        language: language || 'cpp',
        status: 'PENDING',
      },
    });

    res.status(201).json(submission);
  } catch (error) {
    if (error instanceof z.ZodError) {
       res.status(400).json({ message: (error as z.ZodError).issues });
       return;
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSubmissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tournamentId = parseInt(req.params.id);
    const userId = req.user.userId;
    const role = req.user.role;

    const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
    if (!tournament) {
      res.status(404).json({ message: 'Tournament not found' });
      return;
    }

    if (role !== 'ADMIN' && tournament.creatorId !== userId) {
        res.status(403).json({ message: 'Access denied' });
        return;
    }

    const submissions = await prisma.submission.findMany({
      where: { tournamentId },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const gradeSubmissionSchema = z.object({
  score: z.number().int().min(0),
  status: z.enum(['ACCEPTED', 'REJECTED']),
});

export const gradeSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const submissionId = parseInt(req.params.submissionId);
        const { score, status } = gradeSubmissionSchema.parse(req.body);
        
        const submission = await prisma.submission.findUnique({
            where: { id: submissionId },
            include: { tournament: true }
        });

        if (!submission) {
            res.status(404).json({ message: 'Submission not found' });
            return;
        }

        const userId = req.user.userId;
        const role = req.user.role;

        if (role !== 'ADMIN' && submission.tournament.creatorId !== userId) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }

        const updated = await prisma.submission.update({
            where: { id: submissionId },
            data: {
                score,
                status,
            }
        });
        
        // Recalculate total points for the user
        const aggregations = await prisma.submission.aggregate({
            _sum: { score: true },
            where: { userId: submission.userId }
        });
        
        await prisma.user.update({
            where: { id: submission.userId },
            data: { totalPoints: aggregations._sum.score || 0 }
        });

        res.json(updated);
    } catch (error) {
         if (error instanceof z.ZodError) {
            res.status(400).json({ message: (error as z.ZodError).issues });
            return;
         }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
