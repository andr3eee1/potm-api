import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create Users
  const password = await bcrypt.hash('password', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@potm.com' },
    update: {},
    create: {
      email: 'admin@potm.com',
      name: 'Admin User',
      password,
      role: 'ADMIN',
      totalPoints: 1000,
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'alex@potm.com' },
    update: {},
    create: {
      email: 'alex@potm.com',
      name: 'Alex Chen',
      password,
      totalPoints: 2450,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'sarah@potm.com' },
    update: {},
    create: {
      email: 'sarah@potm.com',
      name: 'Sarah Miller',
      password,
      totalPoints: 2320,
    },
  });

  // Create Tournament
  const tournament = await prisma.tournament.create({
    data: {
      title: 'December Code Sprint',
      description: 'A series of algorithmic challenges and mini-games to test your speed and logic.',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      prizePool: '$500',
      tasks: {
        create: [
          { title: 'Binary Search Tree Traversal', description: 'Traverse a BST...', points: 100 },
          { title: 'Dynamic Programming Challenge', description: 'Solve the knapsack problem...', points: 200 },
          { title: 'Graph Shortest Path', description: 'Find the shortest path...', points: 150 },
          { title: 'String Manipulation', description: 'Reverse a string...', points: 50 },
          { title: 'Bit Manipulation', description: 'Count set bits...', points: 75 },
        ],
      },
      participations: {
        create: [
            { userId: user1.id },
            { userId: user2.id }
        ]
      }
    },
  });

  console.log({ admin, user1, user2, tournament });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
