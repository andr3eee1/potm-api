import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAllTournaments = async (req: Request, res: Response) => {
  try {
    const tournaments = await prisma.tournament.findMany({
      include: {
        _count: {
          select: { tasks: true, participations: true }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    res.json(tournaments.map(t => ({
      id: t.id.toString(),
      title: t.title,
      description: t.description,
      status: t.status === 'ACTIVE' ? 'Active' : t.status === 'UPCOMING' ? 'Upcoming' : 'Completed',
      participants: t._count.participations,
      maxParticipants: 100, // Placeholder or add to schema
      startDate: t.startDate.toLocaleDateString(),
      endDate: t.endDate.toLocaleDateString(),
      tasksCount: t._count.tasks,
      difficulty: 'Medium', // Placeholder or add to schema
      color: t.status === 'ACTIVE' ? 'bg-blue-500' : 'bg-slate-500',
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
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { tasks: true, participations: true }
        }
      }
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
      participants: tournament._count.participations,
      maxParticipants: 100,
      startDate: tournament.startDate.toISOString(),
      endDate: tournament.endDate.toISOString(),
      tasksCount: tournament._count.tasks,
      difficulty: 'Medium',
      color: tournament.status === 'ACTIVE' ? 'bg-blue-500' : 'bg-slate-500',
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
});

export const createTournament = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = createTournamentSchema.parse(req.body);

    const tournament = await prisma.tournament.create({
      data: {
        title: data.title,
        description: data.description,
        statement: data.statement,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        prizePool: data.prizePool,
        status: data.status || 'UPCOMING',
      },
    });

    res.status(201).json(tournament);
  } catch (error) {
     if (error instanceof z.ZodError) {
       res.status(400).json({ message: error.issues });
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
      },
    });

    res.json(tournament);
  } catch (error) {
     if (error instanceof z.ZodError) {
       res.status(400).json({ message: error.issues });
       return;
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
