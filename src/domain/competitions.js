"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORTED_COMPETITION_CODES = exports.SUPPORTED_COMPETITIONS = void 0;
exports.isSupportedCompetition = isSupportedCompetition;
exports.SUPPORTED_COMPETITIONS = {
    EPL: {
        code: 'EPL',
        name: 'English Premier League',
        externalId: 39,
        country: 'England',
        logoUrl: 'https://media.api-sports.io/football/leagues/39.png',
    },
    LALIGA: {
        code: 'LALIGA',
        name: 'La Liga',
        externalId: 140,
        country: 'Spain',
        logoUrl: 'https://media.api-sports.io/football/leagues/140.png',
    },
    SPL: {
        code: 'SPL',
        name: 'Saudi Pro League',
        externalId: 307,
        country: 'Saudi-Arabia',
        logoUrl: 'https://media.api-sports.io/football/leagues/307.png',
    },
    UCL: {
        code: 'UCL',
        name: 'UEFA Champions League',
        externalId: 2,
        country: 'World',
        logoUrl: 'https://media.api-sports.io/football/leagues/2.png',
    },
    ACL: {
        code: 'ACL',
        name: 'AFC Champions League',
        externalId: 17,
        country: 'World',
        logoUrl: 'https://media.api-sports.io/football/leagues/17.png',
    },
    EGY: {
        code: 'EGY',
        name: 'Egyptian Premier League',
        externalId: 73,
        country: 'Egypt',
        logoUrl: 'https://media.api-sports.io/football/leagues/73.png',
    },
};
exports.SUPPORTED_COMPETITION_CODES = ['EPL', 'LALIGA', 'SPL', 'UCL', 'ACL', 'EGY'];
function isSupportedCompetition(code) {
    return exports.SUPPORTED_COMPETITION_CODES.includes(code);
}
