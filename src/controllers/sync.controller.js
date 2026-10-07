"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncController = void 0;
const sync_service_1 = require("../services/sync.service");
const response_1 = require("../utils/response");
class SyncController {
    static async triggerSync(req, res, next) {
        try {
            const { type } = req.body; // 'competitions' | 'fixtures' | 'live' | 'all'
            let result = {};
            if (!type || type === 'all' || type === 'competitions') {
                result.syncedCompetitions = await sync_service_1.FootballSyncService.syncCompetitions();
            }
            if (!type || type === 'all' || type === 'fixtures') {
                result.syncedFixtures = await sync_service_1.FootballSyncService.syncFixtures();
            }
            if (!type || type === 'all' || type === 'live') {
                result.updatedLiveFixtures = await sync_service_1.FootballSyncService.syncLiveFixtures();
            }
            (0, response_1.sendSuccess)(res, { status: 'SYNC_COMPLETED', result }, 200);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SyncController = SyncController;
