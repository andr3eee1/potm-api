import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';
import { z } from 'zod';

const createTournamentSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
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

const updateUserSchema = z.object({
  role: z.enum(['USER', 'ADMIN']).optional(),
  totalPoints: z.number().int().optional(),
});

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    const data = updateUserSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.role && { role: data.role }),
        ...(data.totalPoints !== undefined && { totalPoints: data.totalPoints }),
      },
    });

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
     if (error instanceof z.ZodError) {
       res.status(400).json({ message: error.issues });
       return;
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        totalPoints: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
