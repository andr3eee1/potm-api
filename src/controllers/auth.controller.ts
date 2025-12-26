import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
       res.status(401).json({ message: 'Not authenticated' });
       return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Always issue a fresh token to ensure roles are up-to-date
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1d',
    });

    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role, name: user.name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, name } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      res.status(400).json({ message: 'User with this email or username already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userCount = await prisma.user.count();
    const role = userCount === 0 ? 'ADMIN' : 'USER';

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1d',
    });

    res.status(201).json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role, name: user.name } });
  } catch (error) {
    if (error instanceof z.ZodError) {
       res.status(400).json({ message: (error as z.ZodError).issues });
       return;
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1d',
    });

    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role, name: user.name } });
  } catch (error) {
    if (error instanceof z.ZodError) {
       res.status(400).json({ message: (error as z.ZodError).issues });
       return;
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
