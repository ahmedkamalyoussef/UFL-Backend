"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncScheduler = exports.SyncScheduler = void 0;
const sync_service_1 = require("../../services/sync.service");
class SyncScheduler {
    upcomingSyncTimer = null;
    liveSyncTimer = null;
    startScheduler() {
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
    stopScheduler() {
        if (this.upcomingSyncTimer)
            clearInterval(this.upcomingSyncTimer);
        if (this.liveSyncTimer)
            clearInterval(this.liveSyncTimer);
        console.log('[Sync Scheduler] Background football sync scheduler stopped.');
    }
    async runUpcomingSync() {
        try {
            console.log('[Sync Scheduler] Running upcoming competitions and fixtures sync...');
            await sync_service_1.FootballSyncService.syncCompetitions();
            await sync_service_1.FootballSyncService.syncFixtures();
        }
        catch (err) {
            console.error('[Sync Scheduler Error - Upcoming Sync]', err.message || err);
        }
    }
    async runLiveSync() {
        try {
            await sync_service_1.FootballSyncService.syncLiveFixtures();
        }
        catch (err) {
            console.error('[Sync Scheduler Error - Live Sync]', err.message || err);
        }
    }
}
exports.SyncScheduler = SyncScheduler;
exports.syncScheduler = new SyncScheduler();
