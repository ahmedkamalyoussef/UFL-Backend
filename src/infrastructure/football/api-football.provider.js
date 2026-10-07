"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiFootballProvider = void 0;
const api_football_client_1 = require("./api-football-client");
const competitions_1 = require("../../domain/competitions");
class ApiFootballProvider {
    client;
    constructor(client) {
        this.client = client || new api_football_client_1.ApiFootballClient();
    }
    async getCompetitions() {
        if (!this.client.isConfigured()) {
            // Fallback to static whitelist metadata when no API key is provided
            return Object.values(competitions_1.SUPPORTED_COMPETITIONS).map((comp) => ({
                id: `comp-${comp.code.toLowerCase()}`,
                externalId: comp.externalId,
                name: comp.name,
                code: comp.code,
                logoUrl: comp.logoUrl,
            }));
        }
        const data = await this.client.get('/leagues');
        const items = data.response || [];
        const result = [];
        for (const item of items) {
            const externalId = item.league?.id;
            const compMeta = Object.values(competitions_1.SUPPORTED_COMPETITIONS).find((c) => c.externalId === externalId);
            if (compMeta && (0, competitions_1.isSupportedCompetition)(compMeta.code)) {
                result.push({
                    id: `comp-${compMeta.code.toLowerCase()}`,
                    externalId,
                    name: item.league?.name || compMeta.name,
                    code: compMeta.code,
                    logoUrl: item.league?.logo || compMeta.logoUrl,
                });
            }
        }
        // If API response did not contain all 5, fallback to standard supported list
        if (result.length === 0) {
            return Object.values(competitions_1.SUPPORTED_COMPETITIONS).map((comp) => ({
                id: `comp-${comp.code.toLowerCase()}`,
                externalId: comp.externalId,
                name: comp.name,
                code: comp.code,
                logoUrl: comp.logoUrl,
            }));
        }
        return result;
    }
    async getFixtures(competitionId, status) {
        if (!this.client.isConfigured()) {
            return [];
        }
        const params = {};
        // If status is LIVE, use live=all instead of date
        if (status === 'LIVE' || status === 'HALFTIME') {
            params.live = 'all';
        } else {
            // Otherwise, get next 15 upcoming fixtures
            params.next = 15;
        }

        if (competitionId) {
            const compMeta = Object.values(competitions_1.SUPPORTED_COMPETITIONS).find((c) => `comp-${c.code.toLowerCase()}` === competitionId || c.code === competitionId);
            if (compMeta) {
                params.league = compMeta.externalId;
            }
        }
        const data = await this.client.get('/fixtures', params);
        const items = data.response || [];
        return items
            .map((item) => this.normalizeFixture(item))
            .filter((f) => Boolean(f));
    }
    async getFixture(fixtureId) {
        if (!this.client.isConfigured()) {
            return null;
        }
        const data = await this.client.get('/fixtures', { id: fixtureId });
        const items = data.response || [];
        if (items.length === 0) {
            return null;
        }
        return this.normalizeFixture(items[0]);
    }
    async getFixtureEvents(fixtureId) {
        if (!this.client.isConfigured()) {
            return [];
        }
        const data = await this.client.get('/fixtures/events', { fixture: fixtureId });
        const items = data.response || [];
        return items.map((item) => this.normalizeEvent(fixtureId, item));
    }
    async getPlayerStatistics(fixtureId) {
        if (!this.client.isConfigured()) {
            return [];
        }
        const data = await this.client.get('/fixtures/players', { fixture: fixtureId });
        const items = data.response || [];
        const result = [];
        for (const teamItem of items) {
            const players = teamItem.players || [];
            for (const pItem of players) {
                const stats = pItem.statistics?.[0];
                if (stats) {
                    result.push(this.normalizePlayerStats(fixtureId, pItem.player, stats));
                }
            }
        }
        return result;
    }
    // Normalization Helpers
    normalizeFixture(item) {
        if (!item || !item.fixture || !item.league)
            return null;
        const leagueId = item.league.id;
        const compMeta = Object.values(competitions_1.SUPPORTED_COMPETITIONS).find((c) => c.externalId === leagueId);
        // Reject unsupported competition fixtures
        if (!compMeta || !(0, competitions_1.isSupportedCompetition)(compMeta.code)) {
            return null;
        }
        const shortStatus = item.fixture.status?.short;
        let status = 'SCHEDULED';
        if (['1H', '2H', 'ET', 'BT', 'LIVE'].includes(shortStatus)) {
            status = 'LIVE';
        }
        else if (shortStatus === 'HT') {
            status = 'HALFTIME';
        }
        else if (['SUSP', 'INT'].includes(shortStatus)) {
            status = 'SUSPENDED';
        }
        else if (shortStatus === 'PST') {
            status = 'POSTPONED';
        }
        else if (['FT', 'AET', 'PEN'].includes(shortStatus)) {
            status = 'FINISHED';
        }
        else if (['CANC', 'ABD', 'AWD', 'WO'].includes(shortStatus)) {
            status = 'CANCELLED';
        }
        return {
            id: `fix-${item.fixture.id}`,
            externalId: item.fixture.id,
            competitionId: `comp-${compMeta.code.toLowerCase()}`,
            homeTeam: {
                id: `team-${item.teams?.home?.id}`,
                name: item.teams?.home?.name || 'Home Team',
                code: item.teams?.home?.name?.slice(0, 3)?.toUpperCase() || 'HOM',
                logoUrl: item.teams?.home?.logo || '',
            },
            awayTeam: {
                id: `team-${item.teams?.away?.id}`,
                name: item.teams?.away?.name || 'Away Team',
                code: item.teams?.away?.name?.slice(0, 3)?.toUpperCase() || 'AWY',
                logoUrl: item.teams?.away?.logo || '',
            },
            homeScore: item.goals?.home ?? 0,
            awayScore: item.goals?.away ?? 0,
            elapsed: item.fixture.status?.elapsed ?? 0,
            status,
            startTime: new Date(item.fixture.date || Date.now()),
        };
    }
    normalizeEvent(fixtureId, item) {
        const rawType = item.type;
        const rawDetail = item.detail;
        let eventType = 'PASS';
        if (rawType === 'Goal') {
            eventType = 'GOAL';
        }
        else if (rawType === 'Card') {
            eventType = rawDetail?.includes('Red') ? 'RED_CARD' : 'YELLOW_CARD';
        }
        else if (rawType === 'subst') {
            eventType = 'PASS';
        }
        return {
            externalEventId: `evt-${fixtureId}-${item.time?.elapsed}-${item.player?.id}-${rawType}`,
            fixtureId,
            playerId: item.player?.id ? `player-${item.player.id}` : undefined,
            eventType,
            minute: item.time?.elapsed || 0,
            detail: rawDetail || rawType,
        };
    }
    normalizePlayerStats(fixtureId, player, stats) {
        const rawPos = stats.games?.position || 'M';
        let position = 'MIDFIELDER';
        if (['G', 'Goalkeeper'].includes(rawPos)) {
            position = 'GOALKEEPER';
        }
        else if (['D', 'Defender'].includes(rawPos)) {
            position = 'DEFENDER';
        }
        else if (['F', 'Attacker', 'Forward'].includes(rawPos)) {
            position = 'ATTACKER';
        }
        const minutesPlayed = stats.games?.minutes || 0;
        const goalsConceded = stats.goals?.conceded || 0;
        const cleanSheet = goalsConceded === 0 && minutesPlayed >= 60 && (position === 'DEFENDER' || position === 'GOALKEEPER');
        return {
            fixtureId,
            playerId: `player-${player.id}`,
            name: player.name || 'Player',
            position,
            goals: stats.goals?.total || 0,
            assists: stats.goals?.assists || 0,
            bigChancesCreated: 0, // MUST remain 0 as API-Football passes.key is NEVER mapped to Big Chance Created
            successfulPasses: stats.passes?.accuracy ? Math.round(((stats.passes?.total || 0) * stats.passes.accuracy) / 100) : (stats.passes?.total || 0),
            failedPasses: 0,
            tackles: stats.tackles?.total || 0,
            yellowCards: stats.cards?.yellow || 0,
            redCards: stats.cards?.red || 0,
            cleanSheet,
            saves: stats.goals?.saves || 0,
            minutesPlayed,
            totalFantasyPoints: 0,
        };
    }
}
exports.ApiFootballProvider = ApiFootballProvider;
