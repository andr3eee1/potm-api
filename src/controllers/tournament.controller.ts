import { Request, Response } from 'express';
import prisma from '../lib/prisma';

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
