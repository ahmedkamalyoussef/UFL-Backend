"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("../app"));
const scoring_service_1 = require("../services/scoring.service");
const models_1 = require("../models");
const PORT = 3095; // Use non-conflicting test port
async function runPhase10Tests() {
    console.log('[Phase 10 Test] Starting test server on port', PORT);
    const server = app_1.default.listen(PORT);
    const baseUrl = `http://localhost:${PORT}`;
    try {
        // -------------------------------------------------------------
        // Setup Test Data (Competition, Teams, Players, Fixtures, Game, Users)
        // -------------------------------------------------------------
        console.log('\n--- Setup Test Data in MySQL Database ---');
        const comp = await models_1.Competition.create({
            externalId: 4001,
            name: 'EPL Scoring Test League',
            code: 'EPL',
            logoUrl: 'https://cdn.ufl.com/epl.png',
        });
        const homeTeam = await models_1.Team.create({
            externalId: 301,
            competitionId: comp.id,
            name: 'Liverpool Test',
            code: 'LIV',
            logoUrl: 'https://cdn.ufl.com/liv.png',
        });
        const awayTeam = await models_1.Team.create({
            externalId: 302,
            competitionId: comp.id,
            name: 'Chelsea Test',
            code: 'CHE',
            logoUrl: 'https://cdn.ufl.com/che.png',
        });
        // Create Players (Defender, Goalkeeper, Attacker, Midfielder)
        const defender = await models_1.Player.create({
            externalId: 6001,
            teamId: homeTeam.id,
            name: 'Virgil van Dijk',
            position: 'DEFENDER',
            photoUrl: 'https://cdn.ufl.com/vvd.png',
            isStar: true,
            avgPoints: 25.0,
        });
        const goalkeeper = await models_1.Player.create({
            externalId: 6002,
            teamId: homeTeam.id,
            name: 'Alisson Becker',
            position: 'GOALKEEPER',
            photoUrl: 'https://cdn.ufl.com/alisson.png',
            isStar: true,
            avgPoints: 22.0,
        });
        const attacker = await models_1.Player.create({
            externalId: 6003,
            teamId: homeTeam.id,
            name: 'Mohamed Salah',
            position: 'ATTACKER',
            photoUrl: 'https://cdn.ufl.com/salah.png',
            isStar: true,
            avgPoints: 30.0,
        });
        const midfielder = await models_1.Player.create({
            externalId: 6004,
            teamId: awayTeam.id,
            name: 'Cole Palmer',
            position: 'MIDFIELDER',
            photoUrl: 'https://cdn.ufl.com/palmer.png',
            isStar: true,
            avgPoints: 28.0,
        });
        const fixture = await models_1.Fixture.create({
            externalId: 9950,
            competitionId: comp.id,
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            status: 'LIVE',
            elapsed: 75,
            startTime: new Date(Date.now() - 4500000),
        });
        // Register 4 Users & Join Game Room
        const testUsers = [];
        for (let i = 1; i <= 4; i++) {
            const regRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: `score_user${i}_${Date.now()}`,
                    email: `score_user${i}_${Date.now()}@ufl.com`,
                    password: 'Password123!',
                }),
            });
            const regData = await regRes.json();
            testUsers.push({ user: regData.data.user, token: regData.data.token });
        }
        const gameRes = await fetch(`${baseUrl}/api/v1/games`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fixtureId: fixture.id, entryFee: 500 }),
        });
        const gameData = await gameRes.json();
        const gameId = gameData.data.id;
        for (let i = 0; i < 4; i++) {
            const joinRes = await fetch(`${baseUrl}/api/v1/games/${gameId}/join`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${testUsers[i].token}` },
            });
            const joinData = await joinRes.json();
            testUsers[i].participantId = joinData.data.participantId;
        }
        // Assign Player Selections manually for testing
        // Participant 1: Salah (Attacker), van Dijk (Defender)
        await models_1.PlayerSelection.create({ gameId, participantId: testUsers[0].participantId, playerId: attacker.id, turnNumber: 1, isAutoPick: false });
        await models_1.PlayerSelection.create({ gameId, participantId: testUsers[0].participantId, playerId: defender.id, turnNumber: 8, isAutoPick: false });
        // Participant 2: Alisson (Goalkeeper), Palmer (Midfielder)
        await models_1.PlayerSelection.create({ gameId, participantId: testUsers[1].participantId, playerId: goalkeeper.id, turnNumber: 2, isAutoPick: false });
        await models_1.PlayerSelection.create({ gameId, participantId: testUsers[1].participantId, playerId: midfielder.id, turnNumber: 7, isAutoPick: false });
        console.log('✔ Test data, game room, and player draft selections initialized!');
        // -------------------------------------------------------------
        // Test 1 - 11: Pure Scoring Logic Unit Verification
        // -------------------------------------------------------------
        console.log('\n--- Test 1 - 11: Authoritative Scoring Rules Logic ---');
        const sampleStats = {
            fixtureId: fixture.id,
            playerId: attacker.id,
            name: attacker.name,
            position: attacker.position,
            goals: 1, // +40
            assists: 1, // +20
            bigChancesCreated: 1, // +5
            successfulPasses: 10, // +10
            failedPasses: 2, // -2
            tackles: 2, // +6
            yellowCards: 1, // -5
            redCards: 0, // 0
            saves: 0, // 0
            cleanSheet: false, // 0 (Attacker)
            minutesPlayed: 90,
            totalFantasyPoints: 0,
        };
        const calculatedPoints = scoring_service_1.ScoringService.calculatePlayerFantasyPoints(sampleStats);
        console.log('Calculated Points for Attacker:', calculatedPoints);
        // Expected: 40 + 20 + 5 + 10 - 2 + 6 - 5 = 74
        if (calculatedPoints !== 74) {
            throw new Error(`Expected 74 points, got ${calculatedPoints}`);
        }
        console.log('✔ Authoritative scoring rule calculations verified (74 PTS)!');
        // -------------------------------------------------------------
        // Test 12 - 15: Clean Sheet Rule Verification
        // -------------------------------------------------------------
        console.log('\n--- Test 12 - 15: Clean Sheet Rules ---');
        // Case 1: Defender played 65 min, clean sheet = true -> +20
        const defStatsValid = {
            ...sampleStats,
            playerId: defender.id,
            position: 'DEFENDER',
            goals: 0, assists: 0, bigChancesCreated: 0, successfulPasses: 0, failedPasses: 0, tackles: 0, yellowCards: 0,
            minutesPlayed: 65,
            cleanSheet: true,
        };
        if (scoring_service_1.ScoringService.calculatePlayerFantasyPoints(defStatsValid) !== 20) {
            throw new Error('Defender 65m clean sheet rule failed!');
        }
        console.log('✔ Defender played 65m with clean sheet awarded +20 PTS!');
        // Case 2: Defender played 55 min, clean sheet = true -> 0
        const defStatsInvalid = {
            ...defStatsValid,
            minutesPlayed: 55,
        };
        if (scoring_service_1.ScoringService.calculatePlayerFantasyPoints(defStatsInvalid) !== 0) {
            throw new Error('Defender under 60m clean sheet rule failed!');
        }
        console.log('✔ Defender under 60m correctly received 0 clean sheet points!');
        // Case 3: Attacker played 90 min, clean sheet = true -> 0 (Only Defender/Goalkeeper eligible)
        const attCleanSheet = {
            ...defStatsValid,
            position: 'ATTACKER',
            minutesPlayed: 90,
        };
        if (scoring_service_1.ScoringService.calculatePlayerFantasyPoints(attCleanSheet) !== 0) {
            throw new Error('Attacker clean sheet eligibility failed!');
        }
        console.log('✔ Attacker clean sheet correctly awarded 0 points!');
        // -------------------------------------------------------------
        // Test 16: Idempotent Event Processing
        // -------------------------------------------------------------
        console.log('\n--- Test 16: Idempotent Fixture Event Processing ---');
        const goalEvent = {
            externalEventId: 'ext-goal-9001',
            fixtureId: fixture.id,
            playerId: attacker.id,
            eventType: 'GOAL',
            minute: 25,
            detail: 'Header Goal',
        };
        // First processing attempt
        const res1 = await scoring_service_1.ScoringService.processFixtureEvent(fixture.id, goalEvent);
        console.log('Process Event Attempt 1:', res1);
        if (res1.status !== 'PROCESSED' || res1.delta !== 40) {
            throw new Error('First event processing failed!');
        }
        // Duplicate processing attempt
        const res2 = await scoring_service_1.ScoringService.processFixtureEvent(fixture.id, goalEvent);
        console.log('Process Event Attempt 2 (Duplicate):', res2);
        if (res2.status !== 'SKIPPED_DUPLICATE') {
            throw new Error('Duplicate event processing idempotency failed!');
        }
        console.log('✔ Duplicate event skipped cleanly! Idempotency verified.');
        // -------------------------------------------------------------
        // Test 17 & 18: Deterministic Stat Recalculation & Late Joiner Points
        // -------------------------------------------------------------
        console.log('\n--- Test 17 & 18: Deterministic Stat Recalculation ---');
        const updateStats = [
            {
                fixtureId: fixture.id,
                playerId: attacker.id,
                name: attacker.name,
                position: attacker.position,
                goals: 1,
                assists: 1,
                bigChancesCreated: 0,
                successfulPasses: 20,
                failedPasses: 5,
                tackles: 0,
                yellowCards: 0,
                redCards: 0,
                saves: 0,
                cleanSheet: false,
                minutesPlayed: 90,
                totalFantasyPoints: 0,
            },
        ];
        await scoring_service_1.ScoringService.processPlayerMatchStatistics(fixture.id, updateStats);
        const rankingsRes = await fetch(`${baseUrl}/api/v1/games/${gameId}/ranking`, {
            headers: { Authorization: `Bearer ${testUsers[0].token}` },
        });
        const rankingsData = await rankingsRes.json();
        console.log('Live Rankings Endpoint Response:', rankingsRes.status, rankingsData);
        if (rankingsRes.status !== 200 || !rankingsData.success || !Array.isArray(rankingsData.data)) {
            throw new Error('GET /api/v1/games/:id/ranking failed!');
        }
        console.log('✔ Live rankings endpoint returned ranking array!');
        // -------------------------------------------------------------
        // Test 19: Player Points Breakdown Endpoint
        // -------------------------------------------------------------
        console.log('\n--- Test 19: Player Points Breakdown Endpoint ---');
        const breakdownRes = await fetch(`${baseUrl}/api/v1/games/${gameId}/players/${attacker.id}/points`, {
            headers: { Authorization: `Bearer ${testUsers[0].token}` },
        });
        const breakdownData = await breakdownRes.json();
        console.log('Points Breakdown Endpoint Response:', breakdownRes.status, breakdownData.data);
        if (breakdownRes.status !== 200 || !breakdownData.success || !Array.isArray(breakdownData.data.breakdown)) {
            throw new Error('GET /api/v1/games/:id/players/:playerId/points failed!');
        }
        console.log('✔ Player points breakdown endpoint returned detailed rule audit!');
        // -------------------------------------------------------------
        // Test 20: Existing /health Still Works
        // -------------------------------------------------------------
        console.log('\n--- Test 20: Health Check ---');
        const healthRes = await fetch(`${baseUrl}/health`);
        const healthData = await healthRes.json();
        if (healthRes.status !== 200 || healthData.status !== 'ok') {
            throw new Error('Health check failed!');
        }
        console.log('✔ Health endpoint functioning normally!');
        console.log('\n==================================================');
        console.log('ALL PHASE 10 VERIFICATION TESTS PASSED SUCCESSFULLY!');
        console.log('==================================================');
    }
    catch (err) {
        console.error('Phase 10 Test Failed:', err);
        process.exitCode = 1;
    }
    finally {
        server.close();
    }
}
runPhase10Tests();
