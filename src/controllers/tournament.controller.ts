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
