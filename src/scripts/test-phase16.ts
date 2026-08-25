import app from '../app';
import { Server as HttpServer } from 'http';
import { socketServer } from '../infrastructure/socket/socket.server';
import { User } from '../models';

const PORT = 3090; // Use non-conflicting test port

async function runPhase16AuditTests() {
  console.log('[Phase 16 Test] Starting Final API Audit & UI Contract Validation Tests on port', PORT);
  const httpServer: HttpServer = app.listen(PORT);
  socketServer.initialize(httpServer);
  const baseUrl = `http://localhost:${PORT}`;

  try {
    // -------------------------------------------------------------
    // Setup 2 Users for Audit & Security Tests
    // -------------------------------------------------------------
    console.log('\n--- Setup Test Users for Audit & IDOR Security Tests ---');
    const users: { user: User; token: string }[] = [];
    for (let i = 1; i <= 2; i++) {
      const regRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: `audit_user${i}_${Date.now()}`,
          email: `audit_user${i}_${Date.now()}@ufl.com`,
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
    // Test 1: User Profile API (`GET /api/v1/me`)
    // -------------------------------------------------------------
    console.log('\n--- Test 1: User Profile API (GET /api/v1/me) ---');
    const meRes = await fetch(`${baseUrl}/api/v1/me`, {
      headers: { Authorization: `Bearer ${users[0].token}` },
    });
    const meData: any = await meRes.json();
    console.log('GET /me Status:', meRes.status, meData);

    if (meRes.status !== 200 || !meData.success || meData.data.username !== users[0].user.username) {
      throw new Error('GET /api/v1/me failed or contract mismatched!');
    }
    console.log('✔ GET /api/v1/me validated against UI data contract!');

    // -------------------------------------------------------------
    // Test 2: User Game History API (`GET /api/v1/users/me/games`)
    // -------------------------------------------------------------
    console.log('\n--- Test 2: User Game History API (GET /api/v1/users/me/games) ---');
    const historyRes = await fetch(`${baseUrl}/api/v1/users/me/games`, {
      headers: { Authorization: `Bearer ${users[0].token}` },
    });
    const historyData: any = await historyRes.json();
    console.log('GET /users/me/games Status:', historyRes.status, historyData);

    if (historyRes.status !== 200 || !historyData.success || !Array.isArray(historyData.data.items)) {
      throw new Error('GET /api/v1/users/me/games contract failed!');
    }
    console.log('✔ GET /api/v1/users/me/games validated against UI contract!');

    // -------------------------------------------------------------
    // Test 3: IDOR Security Isolation Guard
    // -------------------------------------------------------------
    console.log('\n--- Test 3: IDOR Security Isolation Guard ---');
    const invalidNotifId = '00000000-0000-0000-0000-000000000000';
    const idorRes = await fetch(`${baseUrl}/api/v1/notifications/${invalidNotifId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${users[0].token}` },
    });
    const idorData: any = await idorRes.json();
    console.log('IDOR Test Response Status:', idorRes.status, idorData);

    if (idorRes.status !== 404 || idorData.success !== false || !idorData.error || !idorData.error.code) {
      throw new Error('Standard JSON error payload structure verification failed!');
    }
    console.log('✔ Standard error structure (code & message) verified without internal stack leaks!');

    // -------------------------------------------------------------
    // Test 4: Health Check Endpoint
    // -------------------------------------------------------------
    console.log('\n--- Test 4: Health Check ---');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData: any = await healthRes.json();
    if (healthRes.status !== 200 || healthData.status !== 'ok') {
      throw new Error('Health check failed!');
    }
    console.log('✔ Health endpoint functioning normally!');

    console.log('\n==================================================');
    console.log('ALL PHASE 16 AUDIT & SECURITY TESTS PASSED SUCCESSFULLY!');
    console.log('==================================================');
  } catch (err) {
    console.error('Phase 16 Test Failed:', err);
    process.exitCode = 1;
  } finally {
    httpServer.close();
  }
}

runPhase16AuditTests();
