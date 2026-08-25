import app from '../app';
import { Server as HttpServer } from 'http';
import { socketServer } from '../infrastructure/socket/socket.server';
import { NotificationService } from '../services/notification.service';
import { GameService } from '../services/game.service';
import { Competition, Team, Fixture, Game, User, Notification } from '../models';
import { io as ClientIO } from 'socket.io-client';

const PORT = 3091; // Use non-conflicting test port

async function runPhase15Tests() {
  console.log('[Phase 15 Test] Starting Notifications System Tests on port', PORT);
  const httpServer: HttpServer = app.listen(PORT);
  socketServer.initialize(httpServer);
  const baseUrl = `http://localhost:${PORT}`;

  try {
    // -------------------------------------------------------------
    // Setup Test Data (2 Users)
    // -------------------------------------------------------------
    console.log('\n--- Setup Test Users for Notification Tests ---');
    const users: { user: User; token: string }[] = [];
    for (let i = 1; i <= 2; i++) {
      const regRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: `notif_user${i}_${Date.now()}`,
          email: `notif_user${i}_${Date.now()}@ufl.com`,
          password: 'Password123!',
        }),
      });
      const regData: any = await regRes.json();
      users.push({
        user: regData.data.user,
        token: regData.data.token,
      });
    }

    // -------------------------------------------------------------
    // Test 1: Create Notification & Private Socket.IO Delivery
    // -------------------------------------------------------------
    console.log('\n--- Test 1: Private Socket.IO Notification Delivery ---');
    let socketReceivedNotif: any = null;

    const socketClient = ClientIO(`http://localhost:${PORT}/game`, {
      auth: { token: users[0].token },
      transports: ['websocket'],
    });

    await new Promise<void>((resolve) => {
      socketClient.on('connect', () => {
        console.log('Socket client connected for User 1');
        resolve();
      });
    });

    socketClient.on('notification:new', (data: any) => {
      console.log('[Socket.IO Received notification:new]', data);
      socketReceivedNotif = data;
    });

    const notif1 = await NotificationService.createNotification({
      userId: users[0].user.id,
      type: 'SYSTEM',
      title: 'Welcome to UFL!',
      message: 'Your account has been created with 500 bonus Coins.',
      relatedEntityType: 'USER',
      relatedEntityId: users[0].user.id,
    });

    // Short delay for socket event
    await new Promise((r) => setTimeout(r, 300));

    if (!socketReceivedNotif || socketReceivedNotif.id !== notif1.id) {
      throw new Error('Private Socket.IO notification delivery failed!');
    }
    console.log('✔ Private Socket.IO notification delivered cleanly to user:{userId} room!');

    socketClient.close();

    // -------------------------------------------------------------
    // Test 2 & 3: List Own Notifications & Ownership Isolation
    // -------------------------------------------------------------
    console.log('\n--- Test 2 & 3: List Notifications & Ownership Isolation ---');
    const u1ListRes = await fetch(`${baseUrl}/api/v1/notifications`, {
      headers: { Authorization: `Bearer ${users[0].token}` },
    });
    const u1ListData: any = await u1ListRes.json();
    console.log('User 1 Notifications List:', u1ListData.data);

    if (u1ListRes.status !== 200 || u1ListData.data.items.length !== 1 || u1ListData.data.unreadCount !== 1) {
      throw new Error('User 1 notifications list query failed!');
    }

    const u2ListRes = await fetch(`${baseUrl}/api/v1/notifications`, {
      headers: { Authorization: `Bearer ${users[1].token}` },
    });
    const u2ListData: any = await u2ListRes.json();
    if (u2ListData.data.items.length !== 0) {
      throw new Error('Ownership isolation failed! User 2 received User 1 notifications.');
    }
    console.log('✔ Notifications list query & strict ownership isolation verified!');

    // -------------------------------------------------------------
    // Test 4 & 5: Mark Single Notification Read & Authorization Guard
    // -------------------------------------------------------------
    console.log('\n--- Test 4 & 5: Mark Read & Authorization Guard ---');
    // User 2 tries to mark User 1's notification as read -> 403 Forbidden
    const forbiddenRes = await fetch(`${baseUrl}/api/v1/notifications/${notif1.id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${users[1].token}` },
    });
    console.log('Forbidden Mark Read Status:', forbiddenRes.status);
    if (forbiddenRes.status !== 403) {
      throw new Error('Authorization guard failed! User 2 was able to modify User 1 notification.');
    }

    // User 1 marks own notification as read -> 200 OK
    const readRes = await fetch(`${baseUrl}/api/v1/notifications/${notif1.id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${users[0].token}` },
    });
    const readData: any = await readRes.json();
    console.log('User 1 Mark Read Response:', readData.data);

    if (readRes.status !== 200 || !readData.data.isRead || !readData.data.readAt) {
      throw new Error('Mark notification read failed!');
    }
    console.log('✔ Mark read functionality & ownership authorization guards verified!');

    // -------------------------------------------------------------
    // Test 6: Mark All Notifications as Read
    // -------------------------------------------------------------
    console.log('\n--- Test 6: Mark All Notifications Read ---');
    await NotificationService.createNotification({
      userId: users[0].user.id,
      type: 'WALLET_UPDATE',
      title: 'Coins Added',
      message: 'You received 500 Coins.',
    });

    const readAllRes = await fetch(`${baseUrl}/api/v1/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${users[0].token}` },
    });
    const readAllData: any = await readAllRes.json();
    console.log('Mark All Read Response:', readAllData.data);

    if (readAllRes.status !== 200 || readAllData.data.updatedCount < 1) {
      throw new Error('Mark all read failed!');
    }
    console.log('✔ Mark all notifications read verified cleanly!');

    // -------------------------------------------------------------
    // Test 7 & 8: Cancellation & Refund Notification Creation
    // -------------------------------------------------------------
    console.log('\n--- Test 7 & 8: Cancellation & Refund Notifications ---');
    const comp = await Competition.create({
      externalId: 6001,
      name: 'EPL Notif Test',
      code: 'EPL',
      logoUrl: 'https://cdn.ufl.com/epl.png',
    });
    const homeTeam = await Team.create({
      externalId: 901,
      competitionId: comp.id,
      name: 'City Test',
      code: 'MCI',
      logoUrl: 'https://cdn.ufl.com/mci.png',
    });
    const awayTeam = await Team.create({
      externalId: 902,
      competitionId: comp.id,
      name: 'United Test',
      code: 'MUN',
      logoUrl: 'https://cdn.ufl.com/mun.png',
    });
    const fixture = await Fixture.create({
      externalId: 77701,
      competitionId: comp.id,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      status: 'SCHEDULED',
      startTime: new Date(Date.now() + 3600000),
    });

    const game = await Game.create({
      fixtureId: fixture.id,
      status: 'WAITING',
      entryFee: 500,
    });

    await fetch(`${baseUrl}/api/v1/games/${game.id}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${users[0].token}` },
    });

    // Cancel game & verify notification created
    await GameService.cancelGame(game.id, 'TEST_CANCELLATION');

    const u1NotifsRes = await fetch(`${baseUrl}/api/v1/notifications`, {
      headers: { Authorization: `Bearer ${users[0].token}` },
    });
    const u1NotifsData: any = await u1NotifsRes.json();
    const cancelNotif = u1NotifsData.data.items.find((n: any) => n.type === 'GAME_CANCELLED');
    console.log('Cancellation Notification:', cancelNotif);

    if (!cancelNotif) {
      throw new Error('Game cancellation notification was not created!');
    }
    console.log('✔ Game cancellation & refund notification created cleanly after refund!');

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
    console.log('ALL PHASE 15 VERIFICATION TESTS PASSED SUCCESSFULLY!');
    console.log('==================================================');
  } catch (err) {
    console.error('Phase 15 Test Failed:', err);
    process.exitCode = 1;
  } finally {
    httpServer.close();
  }
}

runPhase15Tests();
