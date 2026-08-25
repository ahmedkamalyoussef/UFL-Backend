import { FootballSyncService } from '../../services/sync.service';

export class SyncScheduler {
  private upcomingSyncTimer: NodeJS.Timeout | null = null;
  private liveSyncTimer: NodeJS.Timeout | null = null;

  public startScheduler(): void {
    console.log('[Sync Scheduler] Starting background football sync scheduler...');

    // 1. Initial Sync Execution
    this.runUpcomingSync();

    // 2. Schedule Upcoming Fixtures Sync every 6 hours
    this.upcomingSyncTimer = setInterval(() => {
      this.runUpcomingSync();
    }, 6 * 60 * 60 * 1000);

    // 3. Schedule Live Fixtures Sync every 30 seconds
    this.liveSyncTimer = setInterval(() => {
      this.runLiveSync();
    }, 30 * 1000);
  }

  public stopScheduler(): void {
    if (this.upcomingSyncTimer) clearInterval(this.upcomingSyncTimer);
    if (this.liveSyncTimer) clearInterval(this.liveSyncTimer);
    console.log('[Sync Scheduler] Background football sync scheduler stopped.');
  }

  private async runUpcomingSync(): Promise<void> {
    try {
      console.log('[Sync Scheduler] Running upcoming competitions and fixtures sync...');
      await FootballSyncService.syncCompetitions();
      await FootballSyncService.syncFixtures();
    } catch (err: any) {
      console.error('[Sync Scheduler Error - Upcoming Sync]', err.message || err);
    }
  }

  private async runLiveSync(): Promise<void> {
    try {
      await FootballSyncService.syncLiveFixtures();
    } catch (err: any) {
      console.error('[Sync Scheduler Error - Live Sync]', err.message || err);
    }
  }
}

export const syncScheduler = new SyncScheduler();
