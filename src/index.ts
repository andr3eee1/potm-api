import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import homeRoutes from './routes/home.routes';
import tournamentRoutes from './routes/tournament.routes';
import adminRoutes from './routes/admin.routes';
import userRoutes from './routes/user.routes';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/home', homeRoutes);
app.use('/tournaments', tournamentRoutes);
app.use('/admin', adminRoutes);
app.use('/users', userRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the POTM API' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
