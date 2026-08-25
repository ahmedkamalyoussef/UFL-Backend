import { Request, Response, NextFunction } from 'express';
import { FootballService } from '../services/football.service';
import { sendSuccess } from '../utils/response';

export class FootballController {
  public static async getCompetitions(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const competitions = await FootballService.getCompetitions();
      sendSuccess(res, competitions, 200);
    } catch (error) {
      next(error);
    }
  }

  public static async getMatches(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, competitionId } = req.query;
      const matches = await FootballService.getMatches(
        status as string | undefined,
        competitionId as string | undefined
      );
      sendSuccess(res, matches, 200);
    } catch (error) {
      next(error);
    }
  }

  public static async getMatchById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const match = await FootballService.getMatchById(id);
      sendSuccess(res, match, 200);
    } catch (error) {
      next(error);
    }
  }
}
