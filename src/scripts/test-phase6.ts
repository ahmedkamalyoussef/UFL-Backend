import app from '../app';
import { Server } from 'http';

const PORT = 3099; // Use non-conflicting test port

async function runPhase6Tests() {
  console.log('[Phase 6 Test] Starting test server on port', PORT);
  const server: Server = app.listen(PORT);

  const baseUrl = `http://localhost:${PORT}`;

  try {
    // Test 14: Existing /health endpoint works
    console.log('\n--- Test 14: GET /health ---');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData: any = await healthRes.json();
    console.log('Health Status:', healthRes.status, healthData);
    if (healthRes.status !== 200 || healthData.status !== 'ok') {
      throw new Error('Health check failed!');
    }

    // Test 1-5: Registration flow & wallet initialization
    console.log('\n--- Test 1-5: User Registration & Atomic Wallet Setup ---');
    const testEmail = `test_${Date.now()}@ufl.com`;
    const testUsername = `user_${Date.now()}`;
    const testPassword = 'SecurePassword123!';

    const regRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUsername,
        email: testEmail,
        password: testPassword,
      }),
    });

    const regData: any = await regRes.json();
    console.log('Register Response Status:', regRes.status, JSON.stringify(regData));
    if (regRes.status !== 201 || !regData.success || !regData.data.token) {
      throw new Error('User registration failed!');
    }

    const token = regData.data.token;
    const userId = regData.data.user.id;

    if (regData.data.wallet.balance !== 500) {
      throw new Error(`Expected balance 500, got ${regData.data.wallet.balance}`);
    }
    console.log('✔ Registration, User creation, Wallet creation, Balance = 500 verified!');

    // Test 6: Duplicate Email Rejection
    console.log('\n--- Test 6: Duplicate Email Rejection ---');
    const dupRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `diff_${Date.now()}`,
        email: testEmail, // Duplicate
        password: testPassword,
      }),
    });
    const dupData: any = await dupRes.json();
    console.log('Duplicate Email Status:', dupRes.status, dupData);
    if (dupRes.status !== 409 || dupData.error.code !== 'DUPLICATE_EMAIL') {
      throw new Error('Duplicate email rejection failed!');
    }
    console.log('✔ Duplicate email correctly rejected with 409 Conflict!');

    // Test 7: Login Success
    console.log('\n--- Test 7: Login Success ---');
    const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    const loginData: any = await loginRes.json();
    console.log('Login Status:', loginRes.status, loginData.success);
    if (loginRes.status !== 200 || !loginData.success || !loginData.data.token) {
      throw new Error('Login failed!');
    }
    console.log('✔ Login succeeded with valid credentials!');

    // Test 8: Wrong Password Rejection
    console.log('\n--- Test 8: Wrong Password Rejection ---');
    const wrongPassRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword999!',
      }),
    });
    const wrongPassData: any = await wrongPassRes.json();
    console.log('Wrong Password Status:', wrongPassRes.status, wrongPassData);
    if (wrongPassRes.status !== 401 || wrongPassData.error.code !== 'INVALID_CREDENTIALS') {
      throw new Error('Wrong password rejection failed!');
    }
    console.log('✔ Wrong password correctly rejected with 401 Unauthorized!');

    // Test 9: JWT-protected GET /api/v1/me
    console.log('\n--- Test 9: Authenticated GET /api/v1/me ---');
    const meRes = await fetch(`${baseUrl}/api/v1/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData: any = await meRes.json();
    console.log('Me Status:', meRes.status, meData);
    if (meRes.status !== 200 || meData.data.id !== userId) {
      throw new Error('Authenticated GET /me failed!');
    }
    console.log('✔ Protected /me endpoint returned correct user profile!');

    // Test 10: Unauthenticated GET /api/v1/me Rejection
    console.log('\n--- Test 10: Unauthenticated GET /api/v1/me ---');
    const unauthRes = await fetch(`${baseUrl}/api/v1/me`);
    const unauthData: any = await unauthRes.json();
    console.log('Unauth Status:', unauthRes.status, unauthData);
    if (unauthRes.status !== 401 || unauthData.error.code !== 'UNAUTHORIZED') {
      throw new Error('Unauthenticated rejection failed!');
    }
    console.log('✔ Unauthenticated request correctly rejected with 401!');

    // Test 11: GET /api/v1/wallet Returns 500 Balance
    console.log('\n--- Test 11: GET /api/v1/wallet ---');
    const walletRes = await fetch(`${baseUrl}/api/v1/wallet`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const walletData: any = await walletRes.json();
    console.log('Wallet Status:', walletRes.status, walletData);
    if (walletRes.status !== 200 || walletData.data.balance !== 500) {
      throw new Error('Wallet balance check failed!');
    }
    console.log('✔ GET /wallet returned balance = 500!');

    // Test 12: GET /api/v1/wallet/transactions Returns WELCOME_BONUS
    console.log('\n--- Test 12: GET /api/v1/wallet/transactions ---');
    const txRes = await fetch(`${baseUrl}/api/v1/wallet/transactions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const txData: any = await txRes.json();
    console.log('Tx Status:', txRes.status, txData.data);
    if (txRes.status !== 200 || !Array.isArray(txData.data) || txData.data.length !== 1 || txData.data[0].type !== 'WELCOME_BONUS') {
      throw new Error('Wallet transactions check failed!');
    }
    console.log('✔ WELCOME_BONUS transaction (+500 Coins) verified in ledger!');

    console.log('\n==================================================');
    console.log('ALL PHASE 6 VERIFICATION TESTS PASSED SUCCESSFULLY!');
    console.log('==================================================');
  } catch (err) {
    console.error('Phase 6 Test Failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runPhase6Tests();
