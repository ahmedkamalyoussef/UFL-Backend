import app from '../app';
import { Server as HttpServer } from 'http';
import { socketServer } from '../infrastructure/socket/socket.server';
import { Competition, Team, Fixture, Game, Player, User, DraftTurn, PlayerSelection } from '../models';
import { io as ioClient, Socket } from 'socket.io-client';

const PORT = 3096; // Use non-conflicting test port

async function runPhase9Tests() {
  console.log('[Phase 9 Test] Starting test HTTP and Socket.IO server on port', PORT);
  const httpServer: HttpServer = app.listen(PORT);
  socketServer.initialize(httpServer);
  const baseUrl = `http://localhost:${PORT}`;

  try {
    // -------------------------------------------------------------
    // Setup Test Data (Competition, Teams, Players, Fixtures, Users)
    // -------------------------------------------------------------
    console.log('\n--- Setup Test Data in MySQL Database ---');
    const comp = await Competition.create({
      externalId: 3999,
      name: 'EPL Phase 9 Test League',
      code: 'EPL',
      logoUrl: 'https://cdn.ufl.com/epl.png',
    });

    const homeTeam = await Team.create({
      externalId: 201,
      competitionId: comp.id,
      name: 'Real Madrid Test',
      code: 'RMA',
      logoUrl: 'https://cdn.ufl.com/rma.png',
    });

    const awayTeam = await Team.create({
      externalId: 202,
      competitionId: comp.id,
      name: 'Barcelona Test',
      code: 'BAR',
      logoUrl: 'https://cdn.ufl.com/bar.png',
    });

    // Create 10 football players for the two teams with various ratings
    const players: Player[] = [];
    for (let i = 1; i <= 10; i++) {
      const p = await Player.create({
        externalId: 5000 + i,
        teamId: i <= 5 ? homeTeam.id : awayTeam.id,
        name: `Football Player ${i}`,
        position: i % 4 === 0 ? 'GOALKEEPER' : i % 4 === 1 ? 'DEFENDER' : i % 4 === 2 ? 'MIDFIELDER' : 'ATTACKER',
        photoUrl: `https://cdn.ufl.com/p${i}.png`,
        isStar: i <= 2,
        avgPoints: 10 + i * 2.5, // Player 10 has highest avgPoints (35.0)
      });
      players.push(p);
    }

    const fixture = await Fixture.create({
      externalId: 9901,
      competitionId: comp.id,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      status: 'SCHEDULED',
      startTime: new Date(Date.now() + 86400000),
    });

    // Register 4 participants
    const testUsers: { user: User; token: string; participantId?: string }[] = [];
    for (let i = 1; i <= 4; i++) {
      const regRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: `draft_user${i}_${Date.now()}`,
          email: `draft_user${i}_${Date.now()}@ufl.com`,
          password: 'Password123!',
        }),
      });
      const regData: any = await regRes.json();
      testUsers.push({
        user: regData.data.user,
        token: regData.data.token,
      });
    }

    console.log('✔ Test fixture, 10 football players, and 4 users registered!');

    // -------------------------------------------------------------
    // Test 1: 4 Users Join Game Room
    // -------------------------------------------------------------
    console.log('\n--- Test 1: Create Game and Join 4 Users ---');
    const gameRes = await fetch(`${baseUrl}/api/v1/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fixtureId: fixture.id, entryFee: 500 }),
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
    console.log('✔ 4 users joined game room! Status = DRAFTING.');

    // -------------------------------------------------------------
    // Test 2 & 3: Draft Initialization & Snake Order Verification
    // -------------------------------------------------------------
    console.log('\n--- Test 2 & 3: Start Draft & Verify Snake Turn Ordering ---');
    const startDraftRes = await fetch(`${baseUrl}/api/v1/games/${gameId}/draft/start`, {
      method: 'POST',
    });
    const startDraftData: any = await startDraftRes.json();
    console.log('Start Draft Status:', startDraftRes.status, startDraftData);
    if (startDraftRes.status !== 200 || !startDraftData.success) {
      throw new Error('Start draft failed!');
    }

    const turns = await DraftTurn.findAll({
      where: { gameId },
      order: [['turnNumber', 'ASC']],
    });

    console.log(
      'Generated Turns:',
      turns.map((t) => `Turn ${t.turnNumber}: Participant ${t.participantId.slice(0, 8)} (Round ${t.round})`)
    );

    if (turns.length !== 8) {
      throw new Error(`Expected 8 draft turns, got ${turns.length}`);
    }

    // Verify Snake Order (P1 -> P2 -> P3 -> P4 -> P4 -> P3 -> P2 -> P1)
    const expectedParticipantOrder = [
      testUsers[0].participantId,
      testUsers[1].participantId,
      testUsers[2].participantId,
      testUsers[3].participantId,
      testUsers[3].participantId,
      testUsers[2].participantId,
      testUsers[1].participantId,
      testUsers[0].participantId,
    ];

    for (let i = 0; i < 8; i++) {
      if (turns[i].participantId !== expectedParticipantOrder[i]) {
        throw new Error(`Snake turn order mismatch at turn ${i + 1}!`);
      }
    }
    console.log('✔ Snake order verified: P1 -> P2 -> P3 -> P4 -> P4 -> P3 -> P2 -> P1!');

    // -------------------------------------------------------------
    // Test 4: Socket.IO Authentication & Private Room Joining
    // -------------------------------------------------------------
    console.log('\n--- Test 4: Socket.IO Authentication & Private Room Connection ---');
    const clientSocket: Socket = ioClient(`${baseUrl}/game`, {
      auth: { token: testUsers[0].token },
      transports: ['websocket'],
    });

    await new Promise<void>((resolve, reject) => {
      clientSocket.on('connect', () => {
        console.log('Client socket connected successfully!');
        clientSocket.emit('game:join-room', { gameId });
      });
      clientSocket.on('game:joined-room', (res: any) => {
        console.log('Joined room confirmation received:', res);
        resolve();
      });
      clientSocket.on('connect_error', (err: any) => reject(err));
    });
    console.log('✔ Socket.IO authenticated connection & private room joining verified!');

    // -------------------------------------------------------------
    // Test 5 & 6: Manual Player Selection (Turn 1 - User 1)
    // -------------------------------------------------------------
    console.log('\n--- Test 5 & 6: Manual Player Selection on Turn 1 ---');
    const select1Res = await fetch(`${baseUrl}/api/v1/games/${gameId}/draft/select`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUsers[0].token}`,
      },
      body: JSON.stringify({ playerId: players[9].id, turnNumber: 1 }), // Select highest rated player 10
    });
    const select1Data: any = await select1Res.json();
    console.log('Select Turn 1 Status:', select1Res.status, select1Data);
    if (select1Res.status !== 200 || !select1Data.success) {
      throw new Error('Turn 1 manual selection failed!');
    }
    console.log('✔ Turn 1 selection succeeded! Player 10 assigned to User 1.');

    // -------------------------------------------------------------
    // Test 7: Wrong Participant Selection Attempt (Turn 2 - User 1 tries when User 2's turn)
    // -------------------------------------------------------------
    console.log('\n--- Test 7: Wrong Participant Selection Attempt on Turn 2 ---');
    const wrongUserRes = await fetch(`${baseUrl}/api/v1/games/${gameId}/draft/select`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUsers[0].token}`, // User 1 when User 2's turn
      },
      body: JSON.stringify({ playerId: players[8].id, turnNumber: 2 }),
    });
    const wrongUserData: any = await wrongUserRes.json();
    console.log('Wrong User Status:', wrongUserRes.status, wrongUserData);
    if (wrongUserRes.status !== 400 || wrongUserData.error.code !== 'WRONG_TURN') {
      throw new Error('Wrong turn participant rejection failed!');
    }
    console.log('✔ Wrong participant selection correctly rejected with 400 WRONG_TURN!');

    // -------------------------------------------------------------
    // Test 8: Duplicate Player Selection Attempt
    // -------------------------------------------------------------
    console.log('\n--- Test 8: Duplicate Player Selection Attempt on Turn 2 ---');
    const dupPlayerRes = await fetch(`${baseUrl}/api/v1/games/${gameId}/draft/select`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUsers[1].token}`, // User 2
      },
      body: JSON.stringify({ playerId: players[9].id, turnNumber: 2 }), // Try selecting player 10 again
    });
    const dupPlayerData: any = await dupPlayerRes.json();
    console.log('Duplicate Player Status:', dupPlayerRes.status, dupPlayerData);
    if (dupPlayerRes.status !== 400 || dupPlayerData.error.code !== 'PLAYER_ALREADY_TAKEN') {
      throw new Error('Duplicate player selection rejection failed!');
    }
    console.log('✔ Selection of already-taken player correctly rejected with 400 PLAYER_ALREADY_TAKEN!');

    // -------------------------------------------------------------
    // Test 9 & 10: Auto-Pick Execution on Turn 2 Expiration
    // -------------------------------------------------------------
    console.log('\n--- Test 9 & 10: Server-side Auto-Pick Execution on Turn 2 Expiration ---');
    // Trigger turn 2 timeout directly via service handler
    const { DraftService } = await import('../services/draft.service');
    await DraftService.handleTurnTimeout(gameId, 2);

    const draftStateAfterTimeout = await DraftService.getDraftState(gameId);
    console.log('Active Turn after Turn 2 timeout:', draftStateAfterTimeout.currentDraftTurn);
    const autoPickSelection = draftStateAfterTimeout.selections.find((s) => s.turnNumber === 2);
    console.log('Auto-pick selection:', autoPickSelection);

    if (!autoPickSelection || !autoPickSelection.isAutoPick || autoPickSelection.playerId !== players[8].id) {
      throw new Error('Auto-pick failed or did not pick highest rated available player!');
    }
    console.log('✔ Auto-pick executed cleanly! Selected highest rated available Player 9 with isAutoPick=true.');

    // -------------------------------------------------------------
    // Test 11: Complete Remaining Turns (Turns 3..8) -> Draft Completion
    // -------------------------------------------------------------
    console.log('\n--- Test 11: Complete Remaining Turns 3..8 ---');
    const playerSelectionOrder = [
      { userIndex: 2, turn: 3, playerIndex: 7 },
      { userIndex: 3, turn: 4, playerIndex: 6 },
      { userIndex: 3, turn: 5, playerIndex: 5 },
      { userIndex: 2, turn: 6, playerIndex: 4 },
      { userIndex: 1, turn: 7, playerIndex: 3 },
      { userIndex: 0, turn: 8, playerIndex: 2 },
    ];

    for (const step of playerSelectionOrder) {
      const res = await fetch(`${baseUrl}/api/v1/games/${gameId}/draft/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUsers[step.userIndex].token}`,
        },
        body: JSON.stringify({ playerId: players[step.playerIndex].id, turnNumber: step.turn }),
      });
      const data: any = await res.json();
      if (res.status !== 200 || !data.success) {
        throw new Error(`Turn ${step.turn} selection failed!`);
      }
    }

    // Verify Draft Completion
    const finalDraftState = await DraftService.getDraftState(gameId);
    console.log('Final Draft State Game Status:', finalDraftState.status);
    console.log('Total Selections Count:', finalDraftState.selections.length);

    if (finalDraftState.status !== 'LIVE' || finalDraftState.selections.length !== 8) {
      throw new Error('Draft completion failed!');
    }

    // Verify each participant has exactly 2 players
    const participantSelectionCounts = new Map<string, number>();
    for (const sel of finalDraftState.selections) {
      participantSelectionCounts.set(sel.participantId, (participantSelectionCounts.get(sel.participantId) || 0) + 1);
    }
    console.log('Selections Per Participant:', Array.from(participantSelectionCounts.entries()));

    for (const [pId, count] of participantSelectionCounts.entries()) {
      if (count !== 2) {
        throw new Error(`Participant ${pId} has ${count} selections instead of 2!`);
      }
    }
    console.log('✔ All 8 selections completed cleanly! Game status = LIVE. Every participant has 2 players.');

    // -------------------------------------------------------------
    // Test 12: Existing /health Still Works
    // -------------------------------------------------------------
    console.log('\n--- Test 12: Health Check ---');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData: any = await healthRes.json();
    if (healthRes.status !== 200 || healthData.status !== 'ok') {
      throw new Error('Health check failed!');
    }
    console.log('✔ Health endpoint functioning normally!');

    clientSocket.close();
    console.log('\n==================================================');
    console.log('ALL PHASE 9 VERIFICATION TESTS PASSED SUCCESSFULLY!');
    console.log('==================================================');
  } catch (err) {
    console.error('Phase 9 Test Failed:', err);
    process.exitCode = 1;
  } finally {
    httpServer.close();
  }
}

runPhase9Tests();
