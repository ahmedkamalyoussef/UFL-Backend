import app from '../app';
import { Server } from 'http';
import { Competition, Team, Fixture, Game, User, Wallet, WalletTransaction, GameParticipant } from '../models';

const PORT = 3097; // Use non-conflicting test port

async function runPhase8Tests() {
  console.log('[Phase 8 Test] Starting test server on port', PORT);
  const server: Server = app.listen(PORT);
  const baseUrl = `http://localhost:${PORT}`;

  try {
    // -------------------------------------------------------------
    // Setup Test Data (Competition, Teams, Fixtures, Users)
    // -------------------------------------------------------------
    console.log('\n--- Setup Test Data in MySQL Database ---');
    const comp = await Competition.create({
      externalId: 3939,
      name: 'English Premier League Test',
      code: 'EPL',
      logoUrl: 'https://cdn.ufl.com/epl.png',
    });

    const homeTeam = await Team.create({
      externalId: 101,
      competitionId: comp.id,
      name: 'Manchester City Test',
      code: 'MCI',
      logoUrl: 'https://cdn.ufl.com/mci.png',
    });

    const awayTeam = await Team.create({
      externalId: 102,
      competitionId: comp.id,
      name: 'Arsenal Test',
      code: 'ARS',
      logoUrl: 'https://cdn.ufl.com/ars.png',
    });

    const fixture = await Fixture.create({
      externalId: 9001,
      competitionId: comp.id,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      status: 'SCHEDULED',
      startTime: new Date(Date.now() + 86400000), // Kickoff in 24 hours
    });

    const liveFixture = await Fixture.create({
      externalId: 9002,
      competitionId: comp.id,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      status: 'LIVE',
      elapsed: 65,
      startTime: new Date(Date.now() - 3600000), // Started 1h ago
    });

    // Create 5 test users with 500 Coins balance each
    const testUsers: { user: User; wallet: Wallet; token: string }[] = [];
    for (let i = 1; i <= 5; i++) {
      const email = `phase8_user${i}_${Date.now()}@ufl.com`;
      const regRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: `p8user${i}_${Date.now()}`,
          email,
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

    console.log('✔ Test fixtures and 5 test users registered successfully!');

    // -------------------------------------------------------------
    // Test 1: Create Game Room for Supported Fixture
    // -------------------------------------------------------------
    console.log('\n--- Test 1: Create Game Room ---');
    const createRes = await fetch(`${baseUrl}/api/v1/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fixtureId: fixture.id, entryFee: 500 }),
    });
    const createData: any = await createRes.json();
    console.log('Create Game Status:', createRes.status, createData);
    if (createRes.status !== 201 || !createData.success || !createData.data.id) {
      throw new Error('Game room creation failed!');
    }
    const gameId = createData.data.id;
    console.log('✔ Game room created with ID:', gameId);

    // -------------------------------------------------------------
    // Test 2: Game Room Discovery (GET /api/v1/games)
    // -------------------------------------------------------------
    console.log('\n--- Test 2: Discover Available Games ---');
    const discRes = await fetch(`${baseUrl}/api/v1/games?status=WAITING`);
    const discData: any = await discRes.json();
    console.log('Discover Status:', discRes.status, discData.data.length, 'games found');
    if (discRes.status !== 200 || !discData.success || !discData.data.some((g: any) => g.id === gameId)) {
      throw new Error('Game room discovery failed!');
    }
    console.log('✔ Created game room discovered in GET /api/v1/games!');

    // -------------------------------------------------------------
    // Test 3: User 1 Joins Successfully
    // -------------------------------------------------------------
    console.log('\n--- Test 3: User 1 Joins Game Room ---');
    const join1Res = await fetch(`${baseUrl}/api/v1/games/${gameId}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${testUsers[0].token}` },
    });
    const join1Data: any = await join1Res.json();
    console.log('Join 1 Status:', join1Res.status, join1Data);
    if (join1Res.status !== 200 || !join1Data.success || join1Data.data.draftPosition !== 1) {
      throw new Error('User 1 join failed!');
    }
    if (join1Data.data.remainingBalance !== 0) {
      throw new Error(`Expected remaining balance 0, got ${join1Data.data.remainingBalance}`);
    }
    console.log('✔ User 1 joined cleanly! 500 Coins deducted, remaining balance = 0.');

    // -------------------------------------------------------------
    // Test 4: Duplicate Join Attempt by User 1 Rejected
    // -------------------------------------------------------------
    console.log('\n--- Test 4: User 1 Duplicate Join Attempt ---');
    const dupJoinRes = await fetch(`${baseUrl}/api/v1/games/${gameId}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${testUsers[0].token}` },
    });
    const dupJoinData: any = await dupJoinRes.json();
    console.log('Duplicate Join Status:', dupJoinRes.status, dupJoinData);
    if (dupJoinRes.status !== 400 || dupJoinData.error.code !== 'ALREADY_JOINED') {
      throw new Error('Duplicate join rejection failed!');
    }
    console.log('✔ Duplicate join attempt correctly rejected with 400 ALREADY_JOINED!');

    // -------------------------------------------------------------
    // Test 5: Insufficient Funds Rejection (User 1 Balance is now 0)
    // -------------------------------------------------------------
    console.log('\n--- Test 5: Insufficient Funds Join Rejection ---');
    // Create second game room
    const game2Res = await fetch(`${baseUrl}/api/v1/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fixtureId: fixture.id, entryFee: 500 }),
    });
    const game2Data: any = await game2Res.json();
    const game2Id = game2Data.data.id;

    // User 1 tries to join game 2 with 0 balance
    const noFundJoinRes = await fetch(`${baseUrl}/api/v1/games/${game2Id}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${testUsers[0].token}` },
    });
    const noFundData: any = await noFundJoinRes.json();
    console.log('No Funds Status:', noFundJoinRes.status, noFundData);
    if (noFundJoinRes.status !== 400 || noFundData.error.code !== 'INSUFFICIENT_FUNDS') {
      throw new Error('Insufficient funds rejection failed!');
    }
    console.log('✔ Insufficient balance join correctly rejected with 400 INSUFFICIENT_FUNDS!');

    // -------------------------------------------------------------
    // Test 6 & 7: Users 2, 3, 4 Join -> Capacity Reaches 4 (Status -> DRAFTING)
    // -------------------------------------------------------------
    console.log('\n--- Test 6 & 7: Users 2, 3, 4 Join Game 1 ---');
    for (let i = 1; i <= 3; i++) {
      const res = await fetch(`${baseUrl}/api/v1/games/${gameId}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${testUsers[i].token}` },
      });
      const data: any = await res.json();
      if (res.status !== 200 || !data.success) {
        throw new Error(`User ${i + 1} join failed!`);
      }
    }
    console.log('✔ Users 2, 3, 4 joined! Room capacity reached 4/4.');

    // Verify room status transitioned to DRAFTING
    const game1InfoRes = await fetch(`${baseUrl}/api/v1/games/${gameId}`);
    const game1InfoData: any = await game1InfoRes.json();
    console.log('Game 1 Info after 4 users:', game1InfoData.data.status, `${game1InfoData.data.currentParticipantCount}/4`);
    if (game1InfoData.data.status !== 'DRAFTING' || game1InfoData.data.currentParticipantCount !== 4) {
      throw new Error('Game room state transition to DRAFTING failed!');
    }

    // -------------------------------------------------------------
    // Test 8: 5th Participant Attempt Rejected (GAME_FULL)
    // -------------------------------------------------------------
    console.log('\n--- Test 8: User 5 Attempts to Join Full Room ---');
    const fullJoinRes = await fetch(`${baseUrl}/api/v1/games/${gameId}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${testUsers[4].token}` },
    });
    const fullJoinData: any = await fullJoinRes.json();
    console.log('Full Join Status:', fullJoinRes.status, fullJoinData);
    if (fullJoinRes.status !== 400 || fullJoinData.error.code !== 'GAME_FULL') {
      throw new Error('Full room rejection failed!');
    }
    console.log('✔ User 5 join to full room correctly rejected with 400 GAME_FULL!');

    // -------------------------------------------------------------
    // Test 9 & 10: Live Match Joining
    // -------------------------------------------------------------
    console.log('\n--- Test 9 & 10: Live Match Room Joining ---');
    const liveGameRes = await fetch(`${baseUrl}/api/v1/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fixtureId: liveFixture.id, entryFee: 500 }),
    });
    const liveGameData: any = await liveGameRes.json();
    const liveGameId = liveGameData.data.id;

    // User 5 joins live match game room
    const liveJoinRes = await fetch(`${baseUrl}/api/v1/games/${liveGameId}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${testUsers[4].token}` },
    });
    const liveJoinData: any = await liveJoinRes.json();
    console.log('Live Join Status:', liveJoinRes.status, liveJoinData);
    if (liveJoinRes.status !== 200 || !liveJoinData.success) {
      throw new Error('Live match room join failed!');
    }
    console.log('✔ User 5 joined LIVE match room successfully! 500 Coins deducted.');

    // -------------------------------------------------------------
    // Test 11 & 12: Cancellation & Idempotent Refund
    // -------------------------------------------------------------
    console.log('\n--- Test 11 & 12: Unfilled Room Cancellation & Refund ---');
    // Live game has 1 participant (User 5). Cancel room.
    const cancelRes = await fetch(`${baseUrl}/api/v1/games/${liveGameId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'UNFILLED_ROOM_AT_KICKOFF' }),
    });
    const cancelData: any = await cancelRes.json();
    console.log('Cancel Status:', cancelRes.status, cancelData);
    if (cancelRes.status !== 200 || cancelData.data.status !== 'CANCELLED' || cancelData.data.refundedCount !== 1) {
      throw new Error('Game cancellation failed!');
    }
    console.log('✔ Room cancelled! Participant refunded 500 Coins.');

    // Verify User 5 balance refunded back to 500
    const user5WalletRes = await fetch(`${baseUrl}/api/v1/wallet`, {
      headers: { Authorization: `Bearer ${testUsers[4].token}` },
    });
    const user5WalletData: any = await user5WalletRes.json();
    console.log('User 5 Balance after refund:', user5WalletData.data.balance);
    if (user5WalletData.data.balance !== 500) {
      throw new Error(`Expected refunded balance 500, got ${user5WalletData.data.balance}`);
    }

    // Duplicate Cancellation Call (Idempotency Test)
    console.log('\n--- Test 13: Duplicate Cancellation Call (Idempotency) ---');
    const dupCancelRes = await fetch(`${baseUrl}/api/v1/games/${liveGameId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'DUPLICATE_TRIGGER' }),
    });
    const dupCancelData: any = await dupCancelRes.json();
    console.log('Duplicate Cancel Status:', dupCancelRes.status, dupCancelData);
    if (dupCancelRes.status !== 200 || dupCancelData.data.refundedCount !== 0) {
      throw new Error('Duplicate cancellation idempotency failed!');
    }
    console.log('✔ Duplicate cancellation executed with 0 additional refunds! Idempotency verified.');

    // -------------------------------------------------------------
    // Test 14: Joining Cancelled Game Rejected
    // -------------------------------------------------------------
    console.log('\n--- Test 14: Join Cancelled Game Rejection ---');
    const joinCancelledRes = await fetch(`${baseUrl}/api/v1/games/${liveGameId}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${testUsers[4].token}` },
    });
    const joinCancelledData: any = await joinCancelledRes.json();
    console.log('Join Cancelled Status:', joinCancelledRes.status, joinCancelledData);
    if (joinCancelledRes.status !== 400 || joinCancelledData.error.code !== 'GAME_CANCELLED') {
      throw new Error('Join cancelled game rejection failed!');
    }
    console.log('✔ Joining cancelled game correctly rejected with 400 GAME_CANCELLED!');

    // -------------------------------------------------------------
    // Test 15: Existing /health Still Works
    // -------------------------------------------------------------
    console.log('\n--- Test 15: Health Check ---');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData: any = await healthRes.json();
    if (healthRes.status !== 200 || healthData.status !== 'ok') {
      throw new Error('Health check failed!');
    }
    console.log('✔ Health endpoint functioning normally!');

    console.log('\n==================================================');
    console.log('ALL PHASE 8 VERIFICATION TESTS PASSED SUCCESSFULLY!');
    console.log('==================================================');
  } catch (err) {
    console.error('Phase 8 Test Failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runPhase8Tests();
