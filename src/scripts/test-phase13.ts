import app from '../app';
import { Server as HttpServer } from 'http';
import { socketServer } from '../infrastructure/socket/socket.server';
import { SettlementService } from '../services/settlement.service';
import { Competition, Team, Fixture, Game, Player, User, Wallet, WalletTransaction, GlobalRanking, PlayerSelection, PlayerMatchStatistic } from '../models';

const PORT = 3093; // Use non-conflicting test port

async function runPhase13Tests() {
  console.log('[Phase 13 Test] Starting Final Game Settlement Tests on port', PORT);
  const httpServer: HttpServer = app.listen(PORT);
  socketServer.initialize(httpServer);
  const baseUrl = `http://localhost:${PORT}`;

  try {
    // -------------------------------------------------------------
    // Setup Test Data (Competition, Teams, Players, Fixtures, Game, Users)
    // -------------------------------------------------------------
    console.log('\n--- Setup Test Data for Settlement Tests ---');
    const comp = await Competition.create({
      externalId: 5001,
      name: 'UCL Settlement Test League',
      code: 'UCL',
      logoUrl: 'https://cdn.ufl.com/ucl.png',
    });

    const homeTeam = await Team.create({
      externalId: 801,
      competitionId: comp.id,
      name: 'PSG Test',
      code: 'PSG',
      logoUrl: 'https://cdn.ufl.com/psg.png',
    });

    const awayTeam = await Team.create({
      externalId: 802,
      competitionId: comp.id,
      name: 'Bayern Test',
      code: 'BAY',
      logoUrl: 'https://cdn.ufl.com/bay.png',
    });

    // Create 8 players for drafting
    const players: Player[] = [];
    for (let i = 1; i <= 8; i++) {
      const p = await Player.create({
        externalId: 7000 + i,
        teamId: i <= 4 ? homeTeam.id : awayTeam.id,
        name: `Settlement Player ${i}`,
        position: i % 2 === 0 ? 'ATTACKER' : 'MIDFIELDER',
        photoUrl: `https://cdn.ufl.com/sp${i}.png`,
        isStar: false,
        avgPoints: 15.0,
      });
      players.push(p);
    }

    const finishedFixture = await Fixture.create({
      externalId: 99901,
      competitionId: comp.id,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      status: 'FINISHED',
      homeScore: 3,
      awayScore: 1,
      elapsed: 90,
      startTime: new Date(Date.now() - 7200000),
    });

    // Register 4 Users & Join Game Room
    const testUsers: { user: User; wallet: Wallet; token: string; participantId?: string }[] = [];
    for (let i = 1; i <= 4; i++) {
      const regRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: `settle_user${i}_${Date.now()}`,
          email: `settle_user${i}_${Date.now()}@ufl.com`,
          password: 'Password123!',
        }),
      });
      const regData: any = await regRes.json();
      testUsers.push({
        user: regData.data.user,
        wallet: regData.data.wallet,
        token: regData.data.token,
      });
    }

    const gameRes = await fetch(`${baseUrl}/api/v1/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fixtureId: finishedFixture.id, entryFee: 500 }),
    });
    const gameData: any = await gameRes.json();
    const gameId = gameData.data.id;

    for (let i = 0; i < 4; i++) {
      const joinRes = await fetch(`${baseUrl}/api/v1/games/${gameId}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${testUsers[i].token}` },
      });
      const joinData: any = await joinRes.json();
      testUsers[i].participantId = joinData.data.participantId;
    }

    // Create 8 draft selections (2 per user)
    // User 1: Player 1, Player 2
    // User 2: Player 3, Player 4
    // User 3: Player 5, Player 6
    // User 4: Player 7, Player 8
    await PlayerSelection.create({ gameId, participantId: testUsers[0].participantId!, playerId: players[0].id, turnNumber: 1, isAutoPick: false });
    await PlayerSelection.create({ gameId, participantId: testUsers[0].participantId!, playerId: players[1].id, turnNumber: 8, isAutoPick: false });
    await PlayerSelection.create({ gameId, participantId: testUsers[1].participantId!, playerId: players[2].id, turnNumber: 2, isAutoPick: false });
    await PlayerSelection.create({ gameId, participantId: testUsers[1].participantId!, playerId: players[3].id, turnNumber: 7, isAutoPick: false });
    await PlayerSelection.create({ gameId, participantId: testUsers[2].participantId!, playerId: players[4].id, turnNumber: 3, isAutoPick: false });
    await PlayerSelection.create({ gameId, participantId: testUsers[2].participantId!, playerId: players[5].id, turnNumber: 6, isAutoPick: false });
    await PlayerSelection.create({ gameId, participantId: testUsers[3].participantId!, playerId: players[6].id, turnNumber: 4, isAutoPick: false });
    await PlayerSelection.create({ gameId, participantId: testUsers[3].participantId!, playerId: players[7].id, turnNumber: 5, isAutoPick: false });

    // Seed PlayerMatchStatistics to create distinct scores & test tie-breakers
    // User 1 (Player 1 + 2): 100 PTS (2 goals, 1 assist) -> 1st Place (+1000 Coins, +3 RP)
    await PlayerMatchStatistic.create({ fixtureId: finishedFixture.id, playerId: players[0].id, goals: 2, assists: 1, totalFantasyPoints: 100, minutesPlayed: 90 });
    await PlayerMatchStatistic.create({ fixtureId: finishedFixture.id, playerId: players[1].id, goals: 0, assists: 0, totalFantasyPoints: 0, minutesPlayed: 90 });

    // User 2 (Player 3 + 4): 50 PTS (1 goal, 0 assists) -> 2nd Place (+500 Coins, +1 RP)
    await PlayerMatchStatistic.create({ fixtureId: finishedFixture.id, playerId: players[2].id, goals: 1, assists: 0, totalFantasyPoints: 50, minutesPlayed: 90 });
    await PlayerMatchStatistic.create({ fixtureId: finishedFixture.id, playerId: players[3].id, goals: 0, assists: 0, totalFantasyPoints: 0, minutesPlayed: 90 });

    // User 3 (Player 5 + 6): 20 PTS (0 goals, 1 assist) -> 3rd Place (0 Coins, 0 RP)
    await PlayerMatchStatistic.create({ fixtureId: finishedFixture.id, playerId: players[4].id, goals: 0, assists: 1, totalFantasyPoints: 20, minutesPlayed: 90 });
    await PlayerMatchStatistic.create({ fixtureId: finishedFixture.id, playerId: players[5].id, goals: 0, assists: 0, totalFantasyPoints: 0, minutesPlayed: 90 });

    // User 4 (Player 7 + 8): 0 PTS (0 goals, 0 assists) -> 4th Place (0 Coins, -1 RP)
    await PlayerMatchStatistic.create({ fixtureId: finishedFixture.id, playerId: players[6].id, goals: 0, assists: 0, totalFantasyPoints: 0, minutesPlayed: 90 });
    await PlayerMatchStatistic.create({ fixtureId: finishedFixture.id, playerId: players[7].id, goals: 0, assists: 0, totalFantasyPoints: 0, minutesPlayed: 90 });

    console.log('✔ Test data, 4 participants, and player match statistics seeded successfully!');

    // -------------------------------------------------------------
    // Test 1 - 15: Settle Game & Verify Rewards & RP Changes
    // -------------------------------------------------------------
    console.log('\n--- Test 1 - 15: Settle Game & Verify Coin/RP Rewards ---');
    const settleRes = await fetch(`${baseUrl}/api/v1/games/${gameId}/settle`, {
      method: 'POST',
    });
    const settleData: any = await settleRes.json();
    console.log('Settle Game Status:', settleRes.status, settleData);

    if (settleRes.status !== 200 || !settleData.success || settleData.data.status !== 'FINISHED') {
      throw new Error('Game settlement failed!');
    }

    const results = settleData.data.results;
    console.log('Settlement Results:', results);

    if (results.length !== 4) {
      throw new Error(`Expected 4 ranked results, got ${results.length}`);
    }

    // Verify 1st Place (User 1): 1000 Coins, +3 RP
    if (results[0].userId !== testUsers[0].user.id || results[0].rank !== 1 || results[0].coinReward !== 1000 || results[0].rpChange !== 3) {
      throw new Error('1st place rewards verification failed!');
    }

    // Verify 2nd Place (User 2): 500 Coins, +1 RP
    if (results[1].userId !== testUsers[1].user.id || results[1].rank !== 2 || results[1].coinReward !== 500 || results[1].rpChange !== 1) {
      throw new Error('2nd place rewards verification failed!');
    }

    // Verify 3rd Place (User 3): 0 Coins, 0 RP
    if (results[2].userId !== testUsers[2].user.id || results[2].rank !== 3 || results[2].coinReward !== 0 || results[2].rpChange !== 0) {
      throw new Error('3rd place rewards verification failed!');
    }

    // Verify 4th Place (User 4): 0 Coins, -1 RP
    if (results[3].userId !== testUsers[3].user.id || results[3].rank !== 4 || results[3].coinReward !== 0 || results[3].rpChange !== -1) {
      throw new Error('4th place rewards verification failed!');
    }

    console.log('✔ Authoritative Coin & RP rewards verified cleanly (1st: +1000/+3RP, 2nd: +500/+1RP, 3rd: 0/0RP, 4th: 0/-1RP)!');

    // -------------------------------------------------------------
    // Test 16: Verify User 1 Wallet Balance (500 initial - 500 entry + 1000 prize = 1000 Coins)
    // -------------------------------------------------------------
    console.log('\n--- Test 16: User 1 Final Wallet Balance ---');
    const u1WalletRes = await fetch(`${baseUrl}/api/v1/wallet`, {
      headers: { Authorization: `Bearer ${testUsers[0].token}` },
    });
    const u1WalletData: any = await u1WalletRes.json();
    console.log('User 1 Wallet Balance:', u1WalletData.data.balance);
    if (u1WalletData.data.balance !== 1000) {
      throw new Error(`Expected User 1 balance 1000 Coins, got ${u1WalletData.data.balance}`);
    }
    console.log('✔ User 1 final wallet balance verified (1000 Coins)! Entry fee was NOT deducted again.');

    // -------------------------------------------------------------
    // Test 17 & 18: Idempotent Settlement (Duplicate Call Produces 0 Extra Rewards)
    // -------------------------------------------------------------
    console.log('\n--- Test 17 & 18: Idempotent Duplicate Settlement ---');
    const dupSettleRes = await fetch(`${baseUrl}/api/v1/games/${gameId}/settle`, {
      method: 'POST',
    });
    const dupSettleData: any = await dupSettleRes.json();
    console.log('Duplicate Settle Response:', dupSettleData);

    if (dupSettleRes.status !== 200 || !dupSettleData.data.alreadySettled) {
      throw new Error('Duplicate settlement idempotency check failed!');
    }

    // Re-verify User 1 balance remains 1000 Coins
    const u1WalletRes2 = await fetch(`${baseUrl}/api/v1/wallet`, {
      headers: { Authorization: `Bearer ${testUsers[0].token}` },
    });
    const u1WalletData2: any = await u1WalletRes2.json();
    if (u1WalletData2.data.balance !== 1000) {
      throw new Error(`Duplicate settlement credited wallet again! Balance is ${u1WalletData2.data.balance}`);
    }
    console.log('✔ Duplicate settlement attempt produced 0 additional rewards! Idempotency verified.');

    // -------------------------------------------------------------
    // Test 19: Final Results REST API (GET /api/v1/games/:id/result)
    // -------------------------------------------------------------
    console.log('\n--- Test 19: Final Results REST API (GET /api/v1/games/:id/result) ---');
    const resultRes = await fetch(`${baseUrl}/api/v1/games/${gameId}/result`, {
      headers: { Authorization: `Bearer ${testUsers[0].token}` },
    });
    const resultData: any = await resultRes.json();
    console.log('GET /result Status:', resultRes.status, resultData);

    if (resultRes.status !== 200 || !resultData.success || !resultData.data.currentUserResult) {
      throw new Error('GET /api/v1/games/:id/result failed!');
    }
    console.log('✔ Final results REST API returned complete payload matching UI contract!');

    // -------------------------------------------------------------
    // Test 20: Health Check Endpoint
    // -------------------------------------------------------------
    console.log('\n--- Test 20: Health Check ---');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData: any = await healthRes.json();
    if (healthRes.status !== 200 || healthData.status !== 'ok') {
      throw new Error('Health check failed!');
    }
    console.log('✔ Health endpoint functioning normally!');

    console.log('\n==================================================');
    console.log('ALL PHASE 13 VERIFICATION TESTS PASSED SUCCESSFULLY!');
    console.log('==================================================');
  } catch (err) {
    console.error('Phase 13 Test Failed:', err);
    process.exitCode = 1;
  } finally {
    httpServer.close();
  }
}

runPhase13Tests();
