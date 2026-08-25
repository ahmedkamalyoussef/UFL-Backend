import { Request, Response, NextFunction } from 'express';
import { FootballSyncService } from '../services/sync.service';
import { sendSuccess } from '../utils/response';

export class SyncController {
  public static async triggerSync(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type } = req.body; // 'competitions' | 'fixtures' | 'live' | 'all'

      let result: any = {};

      if (!type || type === 'all' || type === 'competitions') {
        result.syncedCompetitions = await FootballSyncService.syncCompetitions();
      }
      if (!type || type === 'all' || type === 'fixtures') {
        result.syncedFixtures = await FootballSyncService.syncFixtures();
      }
      if (!type || type === 'all' || type === 'live') {
        result.updatedLiveFixtures = await FootballSyncService.syncLiveFixtures();
      }

      sendSuccess(res, { status: 'SYNC_COMPLETED', result }, 200);
    } catch (error) {
      next(error);
    }
  }
}
