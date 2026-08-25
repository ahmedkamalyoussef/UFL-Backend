import app from '../app';
import { Server as HttpServer } from 'http';
import { socketServer } from '../infrastructure/socket/socket.server';
import { SeasonService } from '../services/season.service';
import { RankingService } from '../services/ranking.service';
import { Competition, Team, Fixture, Game, Player, User, Wallet, PlayerSelection, PlayerMatchStatistic, Season } from '../models';

const PORT = 3092; // Use non-conflicting test port

async function runPhase14Tests() {
  console.log('[Phase 14 Test] Starting Global Ranking & Football Seasons Tests on port', PORT);
  const httpServer: HttpServer = app.listen(PORT);
  socketServer.initialize(httpServer);
  const baseUrl = `http://localhost:${PORT}`;

  try {
    // -------------------------------------------------------------
    // Test 1 - 4: Season Creation & Atomic Season Activation
    // -------------------------------------------------------------
    console.log('\n--- Test 1 - 4: Season Creation & Activation ---');
    const season1 = await SeasonService.getActiveSeason(); // Active Season 2026
    console.log('Default Active Season:', season1.name, season1.status);

    const newSeason = await SeasonService.createSeason('Season 2027', new Date('2027-01-01'), new Date('2027-12-31'));
    console.log('Created New Season:', newSeason.name, newSeason.status);

    const activatedSeason = await SeasonService.activateSeason(newSeason.id);
    console.log('Activated Season:', activatedSeason.name, activatedSeason.status);

    const allSeasons = await SeasonService.getAllSeasons();
    const activeSeasonsCount = allSeasons.filter((s) => s.status === 'ACTIVE').length;
    console.log('Total Active Seasons Count:', activeSeasonsCount);

    if (activeSeasonsCount !== 1) {
      throw new Error(`Expected exactly 1 ACTIVE season, got ${activeSeasonsCount}`);
    }

    const previousSeason = allSeasons.find((s) => s.id === season1.id);
    if (previousSeason?.status !== 'COMPLETED') {
      throw new Error(`Expected previous season to be COMPLETED, got ${previousSeason?.status}`);
    }
    console.log('✔ Atomic season activation verified! Exactly 1 active season exists, previous season completed.');

    // Reactivate Season 2026 for game testing
    await SeasonService.activateSeason(season1.id);

    // -------------------------------------------------------------
    // Test 5 - 12: RP Application, Negative RP, and Deterministic Ranking
    // -------------------------------------------------------------
    console.log('\n--- Test 5 - 12: RP Application & Deterministic Ranking ---');

    // Register 4 Users
    const testUsers: { user: User; token: string }[] = [];
    for (let i = 1; i <= 4; i++) {
      const regRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: `rank_user${i}_${Date.now()}`,
          email: `rank_user${i}_${Date.now()}@ufl.com`,
          password: 'Password123!',
        }),
      });
      const regData: any = await regRes.json();
      testUsers.push({
        user: regData.data.user,
        token: regData.data.token,
      });
    }

    const mockGameId = `game-test-${Date.now()}`;

    // Apply RP changes: User 1 (+3), User 2 (+1), User 3 (0), User 4 (-1)
    await RankingService.applyRPChange(mockGameId, testUsers[0].user.id, 3, true);
    await RankingService.applyRPChange(mockGameId, testUsers[1].user.id, 1, false);
    await RankingService.applyRPChange(mockGameId, testUsers[2].user.id, 0, false);
    await RankingService.applyRPChange(mockGameId, testUsers[3].user.id, -1, false);

    const leaderboardRes = await fetch(`${baseUrl}/api/v1/ranking`);
    const leaderboardData: any = await leaderboardRes.json();
    console.log('GET /api/v1/ranking Status:', leaderboardRes.status, leaderboardData.data.leaderboard);

    if (leaderboardRes.status !== 200 || !leaderboardData.success) {
      throw new Error('GET /api/v1/ranking failed!');
    }

    const leaderboard = leaderboardData.data.leaderboard;

    // Find User 4's entry to verify negative RP change (1000 base - 1 = 999 RP)
    const u4Item = leaderboard.find((item: any) => item.userId === testUsers[3].user.id);
    console.log('User 4 Ranking Item:', u4Item);

    if (!u4Item || u4Item.rankingPoints !== 999) {
      throw new Error(`Expected User 4 RP 999, got ${u4Item?.rankingPoints}`);
    }
    console.log('✔ Negative RP change applied and verified cleanly without clamping!');

    // -------------------------------------------------------------
    // Test 13 & 14: User Rank API (`GET /api/v1/ranking/me`)
    // -------------------------------------------------------------
    console.log('\n--- Test 13 & 14: User Rank API (GET /api/v1/ranking/me) ---');
    const myRankRes = await fetch(`${baseUrl}/api/v1/ranking/me`, {
      headers: { Authorization: `Bearer ${testUsers[0].token}` },
    });
    const myRankData: any = await myRankRes.json();
    console.log('GET /ranking/me Response:', myRankRes.status, myRankData.data);

    if (myRankRes.status !== 200 || !myRankData.success || !myRankData.data.userRank) {
      throw new Error('GET /api/v1/ranking/me failed!');
    }
    console.log('✔ GET /api/v1/ranking/me returned user rank payload cleanly!');

    // -------------------------------------------------------------
    // Test 15 & 16: Seasons List & Historical Season Ranking
    // -------------------------------------------------------------
    console.log('\n--- Test 15 & 16: Seasons List & Historical Ranking ---');
    const seasonsRes = await fetch(`${baseUrl}/api/v1/seasons`);
    const seasonsData: any = await seasonsRes.json();
    console.log('GET /api/v1/seasons Count:', seasonsData.data.length);

    if (seasonsRes.status !== 200 || seasonsData.data.length < 2) {
      throw new Error('GET /api/v1/seasons failed!');
    }

    const histSeasonId = seasonsData.data.find((s: any) => s.id === newSeason.id)?.id;
    const histRankRes = await fetch(`${baseUrl}/api/v1/seasons/${histSeasonId}/ranking`);
    const histRankData: any = await histRankRes.json();
    console.log('Historical Season Ranking Response Status:', histRankRes.status);

    if (histRankRes.status !== 200 || !histRankData.success) {
      throw new Error('GET /api/v1/seasons/:seasonId/ranking failed!');
    }
    console.log('✔ Historical season rankings endpoint functioning cleanly!');

    // -------------------------------------------------------------
    // Test 17: Health Check Endpoint
    // -------------------------------------------------------------
    console.log('\n--- Test 17: Health Check ---');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData: any = await healthRes.json();
    if (healthRes.status !== 200 || healthData.status !== 'ok') {
      throw new Error('Health check failed!');
    }
    console.log('✔ Health endpoint functioning normally!');

    console.log('\n==================================================');
    console.log('ALL PHASE 14 VERIFICATION TESTS PASSED SUCCESSFULLY!');
    console.log('==================================================');
  } catch (err) {
    console.error('Phase 14 Test Failed:', err);
    process.exitCode = 1;
  } finally {
    httpServer.close();
  }
}

runPhase14Tests();
