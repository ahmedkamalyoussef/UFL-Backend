import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import healthRoutes from './routes/health.routes';
import apiV1Routes from './routes/index';
import { errorHandler } from './middleware/error.middleware';

const app: Express = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Base health route
app.use('/', healthRoutes);

// API v1 routes
app.use('/api/v1', apiV1Routes);

// Global Error Handler
app.use(errorHandler);

export default app;
