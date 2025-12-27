import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);

    // Fetch user with participations
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        totalPoints: true,
        createdAt: true,
        submissions: {
          include: {
            tournament: {
              select: {
                id: true,
                title: true,
                status: true,
                startDate: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Calculate Rank
    // Count users with more points than this user
    const rank = await prisma.user.count({
      where: {
        totalPoints: {
          gt: user.totalPoints
        }
      }
    }) + 1;

    res.json({
      id: user.id,
      name: user.name || user.email.split('@')[0],
      email: user.email,
      role: user.role,
      totalPoints: user.totalPoints,
      joinedAt: user.createdAt,
      rank,
      submissions: user.submissions.map(s => ({
        id: s.id,
        tournamentId: s.tournament.id,
        tournamentTitle: s.tournament.title,
        status: s.status,
        submittedAt: s.createdAt,
        score: s.score
      }))
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
