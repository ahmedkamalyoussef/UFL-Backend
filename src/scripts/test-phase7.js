"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("../app"));
const api_football_provider_1 = require("../infrastructure/football/api-football.provider");
const competitions_1 = require("../domain/competitions");
const PORT = 3098; // Use test port
async function runPhase7Tests() {
    console.log('[Phase 7 Test] Starting test server on port', PORT);
    const server = app_1.default.listen(PORT);
    const baseUrl = `http://localhost:${PORT}`;
    try {
        // Test 1: FootballProvider & ApiFootballProvider Handling
        console.log('\n--- Test 1 & 2: ApiFootballProvider Environment Safety ---');
        const provider = new api_football_provider_1.ApiFootballProvider();
        const competitionsFromProvider = await provider.getCompetitions();
        console.log('Provider Competitions Count:', competitionsFromProvider.length);
        if (competitionsFromProvider.length !== 5) {
            throw new Error(`Expected 5 supported competitions from provider, got ${competitionsFromProvider.length}`);
        }
        console.log('✔ ApiFootballProvider initializes cleanly without hardcoded keys!');
        // Test 3: Supported Competition Whitelist Filtering
        console.log('\n--- Test 3 & 4: Supported Competition Whitelist Filtering ---');
        console.log('Supported Codes:', competitions_1.SUPPORTED_COMPETITION_CODES);
        if (!(0, competitions_1.isSupportedCompetition)('EPL') || !(0, competitions_1.isSupportedCompetition)('LALIGA') || !(0, competitions_1.isSupportedCompetition)('SPL')) {
            throw new Error('Supported competitions check failed for valid codes!');
        }
        if ((0, competitions_1.isSupportedCompetition)('BUNDESLIGA') || (0, competitions_1.isSupportedCompetition)('SERIE_A') || (0, competitions_1.isSupportedCompetition)('MLS')) {
            throw new Error('Supported competitions check failed! Non-whitelisted code was accepted.');
        }
        console.log('✔ Non-whitelisted competitions (BUNDESLIGA, SERIE_A, MLS) are correctly rejected!');
        // Test 5: GET /api/v1/competitions
        console.log('\n--- Test 5: GET /api/v1/competitions ---');
        const compRes = await fetch(`${baseUrl}/api/v1/competitions`);
        const compData = await compRes.json();
        console.log('GET /competitions Status:', compRes.status, compData);
        if (compRes.status !== 200 || !compData.success || !Array.isArray(compData.data) || compData.data.length !== 5) {
            throw new Error('GET /api/v1/competitions failed!');
        }
        console.log('✔ GET /api/v1/competitions returned 5 supported competitions in standard API envelope!');
        // Test 6: GET /api/v1/matches
        console.log('\n--- Test 6: GET /api/v1/matches ---');
        const matchRes = await fetch(`${baseUrl}/api/v1/matches`);
        const matchData = await matchRes.json();
        console.log('GET /matches Status:', matchRes.status, matchData);
        if (matchRes.status !== 200 || !matchData.success || !Array.isArray(matchData.data)) {
            throw new Error('GET /api/v1/matches failed!');
        }
        console.log('✔ GET /api/v1/matches returned standard response envelope!');
        // Test 7: GET /api/v1/matches/:id (404 for invalid ID)
        console.log('\n--- Test 7: GET /api/v1/matches/non-existent-id ---');
        const matchIdRes = await fetch(`${baseUrl}/api/v1/matches/non-existent-id`);
        const matchIdData = await matchIdRes.json();
        console.log('GET /matches/:id Status:', matchIdRes.status, matchIdData);
        if (matchIdRes.status !== 404 || matchIdData.error.code !== 'MATCH_NOT_FOUND') {
            throw new Error('GET /api/v1/matches/:id invalid ID test failed!');
        }
        console.log('✔ GET /api/v1/matches/:id returned clean 404 error envelope!');
        // Test 8: Existing /health Still Works
        console.log('\n--- Test 8: GET /health ---');
        const healthRes = await fetch(`${baseUrl}/health`);
        const healthData = await healthRes.json();
        console.log('Health Status:', healthRes.status, healthData);
        if (healthRes.status !== 200 || healthData.status !== 'ok') {
            throw new Error('Health check failed!');
        }
        console.log('✔ Health endpoint functioning normally!');
        console.log('\n==================================================');
        console.log('ALL PHASE 7 VERIFICATION TESTS PASSED SUCCESSFULLY!');
        console.log('==================================================');
    }
    catch (err) {
        console.error('Phase 7 Test Failed:', err);
        process.exitCode = 1;
    }
    finally {
        server.close();
    }
}
runPhase7Tests();
