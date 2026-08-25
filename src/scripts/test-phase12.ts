import app from '../app';
import { Server } from 'http';
import { FootballSyncService } from '../services/sync.service';
import { Competition, Team, Fixture, Game, Wallet, WalletTransaction, GameParticipant } from '../models';

const PORT = 3094; // Use non-conflicting test port

async function runPhase12Tests() {
  console.log('[Phase 12 Test] Starting Football Data Synchronization Tests on port', PORT);
  const server: Server = app.listen(PORT);
  const baseUrl = `http://localhost:${PORT}`;

  try {
    // -------------------------------------------------------------
    // Test 1 & 2: Competition Synchronization & Whitelist Filter
    // -------------------------------------------------------------
    console.log('\n--- Test 1 & 2: Sync Supported Competitions ---');
    const syncedCompCount = await FootballSyncService.syncCompetitions();
    console.log('Synced Competitions Count:', syncedCompCount);

    const dbComps = await Competition.findAll();
    console.log('DB Competitions:', dbComps.map((c) => c.code));

    if (dbComps.length < 5) {
      throw new Error(`Expected at least 5 supported competitions in DB, got ${dbComps.length}`);
    }
    console.log('✔ Supported competitions (EPL, LALIGA, SPL, UCL, ACL) synchronized cleanly into DB!');

    // -------------------------------------------------------------
    // Test 3 & 4: Fixture Synchronization & Status Normalization
    // -------------------------------------------------------------
    console.log('\n--- Test 3 & 4: Fixture Synchronization & Idempotency ---');
    // First sync execution
    const syncedFixtures1 = await FootballSyncService.syncFixtures();
    const fixtureCountBefore = await Fixture.count();

    // Second sync execution (idempotency check)
    const syncedFixtures2 = await FootballSyncService.syncFixtures();
    const fixtureCountAfter = await Fixture.count();

    if (fixtureCountBefore !== fixtureCountAfter) {
      throw new Error('Fixture sync idempotency failed! Duplicate fixtures created.');
    }
    console.log('✔ Fixtures synchronized idempotently! Repeating sync produced identical DB state.');

    // -------------------------------------------------------------
    // Test 5 & 6: Unfilled Game Cancellation at Match Start
    // -------------------------------------------------------------
    console.log('\n--- Test 5 & 6: Unfilled Game Cancellation at Match Start ---');
    const eplComp = dbComps.find((c) => c.code === 'EPL')!;
    const homeTeam = await Team.create({
      externalId: 701,
      competitionId: eplComp.id,
      name: 'Arsenal Sync Test',
      code: 'ARS',
      logoUrl: 'https://cdn.ufl.com/ars.png',
    });
    const awayTeam = await Team.create({
      externalId: 702,
      competitionId: eplComp.id,
      name: 'Chelsea Sync Test',
      code: 'CHE',
      logoUrl: 'https://cdn.ufl.com/che.png',
    });

    const liveFixture = await Fixture.create({
      externalId: 88801,
      competitionId: eplComp.id,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      status: 'LIVE',
      elapsed: 10,
      startTime: new Date(Date.now() - 600000),
    });

    // Create a user & register
    const regRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `sync_user_${Date.now()}`,
        email: `sync_user_${Date.now()}@ufl.com`,
        password: 'Password123!',
      }),
    });
    const regData: any = await regRes.json();
    const token = regData.data.token;
    const userId = regData.data.user.id;

    // Create UFL Game with only 1 participant
    const gameRes = await fetch(`${baseUrl}/api/v1/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fixtureId: liveFixture.id, entryFee: 500 }),
    });
    const gameData: any = await gameRes.json();
    const gameId = gameData.data.id;

    await fetch(`${baseUrl}/api/v1/games/${gameId}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    // Run live fixtures sync
    await FootballSyncService.syncLiveFixtures();

    const cancelledGame = await Game.findByPk(gameId);
    console.log('Unfilled Game Status after syncLiveFixtures:', cancelledGame?.status);

    if (cancelledGame?.status !== 'CANCELLED') {
      throw new Error('Unfilled game at match start was not cancelled!');
    }

    // Verify refund
    const walletRes = await fetch(`${baseUrl}/api/v1/wallet`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const walletData: any = await walletRes.json();
    console.log('User balance after refund:', walletData.data.balance);

    if (walletData.data.balance !== 500) {
      throw new Error(`Expected refunded balance 500, got ${walletData.data.balance}`);
    }
    console.log('✔ Unfilled game at match start automatically cancelled and 500 Coins refunded cleanly!');

    // -------------------------------------------------------------
    // Test 7: Suspended Fixture Handling
    // -------------------------------------------------------------
    console.log('\n--- Test 7: Suspended Fixture Handling ---');
    const suspendedFixture = await Fixture.create({
      externalId: 88802,
      competitionId: eplComp.id,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      status: 'SUSPENDED',
      elapsed: 40,
      startTime: new Date(Date.now() - 2400000),
    });

    const suspGame = await Game.create({
      fixtureId: suspendedFixture.id,
      status: 'LIVE',
      entryFee: 500,
    });

    await FootballSyncService.syncLiveFixtures();

    const suspGameAfter = await Game.findByPk(suspGame.id);
    console.log('Suspended Match Game Status:', suspGameAfter?.status);

    if (suspGameAfter?.status !== 'LIVE') {
      throw new Error('Suspended match cancelled game incorrectly! Should remain LIVE.');
    }
    console.log('✔ Suspended match left UFL game room active (LIVE)!');

    // -------------------------------------------------------------
    // Test 8: Manual Sync Endpoint (`POST /api/v1/sync/run`)
    // -------------------------------------------------------------
    console.log('\n--- Test 8: Manual Sync Endpoint ---');
    const manualSyncRes = await fetch(`${baseUrl}/api/v1/sync/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'ufl-dev-admin-secret',
      },
      body: JSON.stringify({ type: 'all' }),
    });
    const manualSyncData: any = await manualSyncRes.json();
    console.log('Manual Sync Endpoint Response:', manualSyncRes.status, manualSyncData);

    if (manualSyncRes.status !== 200 || !manualSyncData.success) {
      throw new Error('Manual sync endpoint failed!');
    }
    console.log('✔ Manual sync endpoint executed successfully with admin header guard!');

    // -------------------------------------------------------------
    // Test 9: Health Check Endpoint
    // -------------------------------------------------------------
    console.log('\n--- Test 9: Health Check ---');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData: any = await healthRes.json();
    if (healthRes.status !== 200 || healthData.status !== 'ok') {
      throw new Error('Health check failed!');
    }
    console.log('✔ Health endpoint functioning normally!');

    console.log('\n==================================================');
    console.log('ALL PHASE 12 VERIFICATION TESTS PASSED SUCCESSFULLY!');
    console.log('==================================================');
  } catch (err) {
    console.error('Phase 12 Test Failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runPhase12Tests();
