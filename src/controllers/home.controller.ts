import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const activeTournamentsCount = await prisma.tournament.count({
      where: { status: 'ACTIVE' },
    });

    const totalParticipantsCount = await prisma.user.count(); // Simplified for now, total users

    const nextContest = await prisma.tournament.findFirst({
      where: {
        status: 'UPCOMING',
        startDate: { gt: new Date() },
      },
      orderBy: { startDate: 'asc' },
    });

    const featuredTournament = await prisma.tournament.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        _count: {
          select: { participations: true, tasks: true },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    const leaderboard = await prisma.user.findMany({
      take: 5,
      orderBy: { totalPoints: 'desc' },
      select: {
        name: true,
        totalPoints: true,
        email: true, // as fallback for name
      },
    });

    res.json({
      activeTournaments: activeTournamentsCount,
      totalParticipants: totalParticipantsCount,
      nextContest: nextContest ? nextContest.startDate : null,
      featuredTournament: featuredTournament
        ? {
            title: featuredTournament.title,
            description: featuredTournament.description,
            status: featuredTournament.status,
            participants: featuredTournament._count.participations,
            tasks: featuredTournament._count.tasks,
            prizePool: featuredTournament.prizePool,
            endDate: featuredTournament.endDate,
          }
        : null,
      leaderboard: leaderboard.map((user, index) => ({
        name: user.name || user.email.split('@')[0],
        score: user.totalPoints,
        rank: index + 1,
        avatar: (user.name || user.email)[0].toUpperCase(),
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
