import { Router } from 'express';
import { FootballController } from '../controllers/football.controller';

export const competitionsRouter = Router();
competitionsRouter.get('/', FootballController.getCompetitions);

export const matchesRouter = Router();
matchesRouter.get('/', FootballController.getMatches);
matchesRouter.get('/:id', FootballController.getMatchById);
