"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = exports.GlobalRanking = exports.Season = exports.PlayerSelection = exports.DraftTurn = exports.GameParticipant = exports.Game = exports.PlayerMatchStatistic = exports.FixtureEvent = exports.Fixture = exports.Player = exports.Team = exports.Competition = exports.WalletTransaction = exports.Wallet = exports.User = void 0;
const User_1 = require("./User");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return User_1.User; } });
const Wallet_1 = require("./Wallet");
Object.defineProperty(exports, "Wallet", { enumerable: true, get: function () { return Wallet_1.Wallet; } });
const WalletTransaction_1 = require("./WalletTransaction");
Object.defineProperty(exports, "WalletTransaction", { enumerable: true, get: function () { return WalletTransaction_1.WalletTransaction; } });
const Competition_1 = require("./Competition");
Object.defineProperty(exports, "Competition", { enumerable: true, get: function () { return Competition_1.Competition; } });
const Team_1 = require("./Team");
Object.defineProperty(exports, "Team", { enumerable: true, get: function () { return Team_1.Team; } });
const Player_1 = require("./Player");
Object.defineProperty(exports, "Player", { enumerable: true, get: function () { return Player_1.Player; } });
const Fixture_1 = require("./Fixture");
Object.defineProperty(exports, "Fixture", { enumerable: true, get: function () { return Fixture_1.Fixture; } });
const FixtureEvent_1 = require("./FixtureEvent");
Object.defineProperty(exports, "FixtureEvent", { enumerable: true, get: function () { return FixtureEvent_1.FixtureEvent; } });
const PlayerMatchStatistic_1 = require("./PlayerMatchStatistic");
Object.defineProperty(exports, "PlayerMatchStatistic", { enumerable: true, get: function () { return PlayerMatchStatistic_1.PlayerMatchStatistic; } });
const Game_1 = require("./Game");
Object.defineProperty(exports, "Game", { enumerable: true, get: function () { return Game_1.Game; } });
const GameParticipant_1 = require("./GameParticipant");
Object.defineProperty(exports, "GameParticipant", { enumerable: true, get: function () { return GameParticipant_1.GameParticipant; } });
const DraftTurn_1 = require("./DraftTurn");
Object.defineProperty(exports, "DraftTurn", { enumerable: true, get: function () { return DraftTurn_1.DraftTurn; } });
const PlayerSelection_1 = require("./PlayerSelection");
Object.defineProperty(exports, "PlayerSelection", { enumerable: true, get: function () { return PlayerSelection_1.PlayerSelection; } });
const Season_1 = require("./Season");
Object.defineProperty(exports, "Season", { enumerable: true, get: function () { return Season_1.Season; } });
const GlobalRanking_1 = require("./GlobalRanking");
Object.defineProperty(exports, "GlobalRanking", { enumerable: true, get: function () { return GlobalRanking_1.GlobalRanking; } });
const Notification_1 = require("./Notification");
Object.defineProperty(exports, "Notification", { enumerable: true, get: function () { return Notification_1.Notification; } });
// -------------------------------------------------------------
// Model Associations Definition
// -------------------------------------------------------------
// User <-> Wallet (1:1)
User_1.User.hasOne(Wallet_1.Wallet, { foreignKey: 'userId', as: 'wallet', onDelete: 'CASCADE' });
Wallet_1.Wallet.belongsTo(User_1.User, { foreignKey: 'userId', as: 'user' });
// Wallet <-> WalletTransaction (1:N)
Wallet_1.Wallet.hasMany(WalletTransaction_1.WalletTransaction, { foreignKey: 'walletId', as: 'transactions', onDelete: 'CASCADE' });
WalletTransaction_1.WalletTransaction.belongsTo(Wallet_1.Wallet, { foreignKey: 'walletId', as: 'wallet' });
// User <-> WalletTransaction (shortcut association)
User_1.User.hasMany(WalletTransaction_1.WalletTransaction, { foreignKey: 'walletId', sourceKey: 'id', as: 'transactions' });
// Competition <-> Team (1:N)
Competition_1.Competition.hasMany(Team_1.Team, { foreignKey: 'competitionId', as: 'teams', onDelete: 'CASCADE' });
Team_1.Team.belongsTo(Competition_1.Competition, { foreignKey: 'competitionId', as: 'competition' });
// Competition <-> Fixture (1:N)
Competition_1.Competition.hasMany(Fixture_1.Fixture, { foreignKey: 'competitionId', as: 'fixtures', onDelete: 'CASCADE' });
Fixture_1.Fixture.belongsTo(Competition_1.Competition, { foreignKey: 'competitionId', as: 'competition' });
// Team <-> Player (1:N)
Team_1.Team.hasMany(Player_1.Player, { foreignKey: 'teamId', as: 'players', onDelete: 'CASCADE' });
Player_1.Player.belongsTo(Team_1.Team, { foreignKey: 'teamId', as: 'team' });
// Team <-> Fixture (Home / Away Teams)
Team_1.Team.hasMany(Fixture_1.Fixture, { foreignKey: 'homeTeamId', as: 'homeFixtures' });
Team_1.Team.hasMany(Fixture_1.Fixture, { foreignKey: 'awayTeamId', as: 'awayFixtures' });
Fixture_1.Fixture.belongsTo(Team_1.Team, { foreignKey: 'homeTeamId', as: 'homeTeam' });
Fixture_1.Fixture.belongsTo(Team_1.Team, { foreignKey: 'awayTeamId', as: 'awayTeam' });
// Fixture <-> FixtureEvent (1:N)
Fixture_1.Fixture.hasMany(FixtureEvent_1.FixtureEvent, { foreignKey: 'fixtureId', as: 'events', onDelete: 'CASCADE' });
FixtureEvent_1.FixtureEvent.belongsTo(Fixture_1.Fixture, { foreignKey: 'fixtureId', as: 'fixture' });
// Player <-> FixtureEvent (1:N)
Player_1.Player.hasMany(FixtureEvent_1.FixtureEvent, { foreignKey: 'playerId', as: 'events', onDelete: 'SET NULL' });
FixtureEvent_1.FixtureEvent.belongsTo(Player_1.Player, { foreignKey: 'playerId', as: 'player' });
// Fixture <-> PlayerMatchStatistic (1:N)
Fixture_1.Fixture.hasMany(PlayerMatchStatistic_1.PlayerMatchStatistic, { foreignKey: 'fixtureId', as: 'playerStatistics', onDelete: 'CASCADE' });
PlayerMatchStatistic_1.PlayerMatchStatistic.belongsTo(Fixture_1.Fixture, { foreignKey: 'fixtureId', as: 'fixture' });
// Player <-> PlayerMatchStatistic (1:N)
Player_1.Player.hasMany(PlayerMatchStatistic_1.PlayerMatchStatistic, { foreignKey: 'playerId', as: 'matchStatistics', onDelete: 'CASCADE' });
PlayerMatchStatistic_1.PlayerMatchStatistic.belongsTo(Player_1.Player, { foreignKey: 'playerId', as: 'player' });
// Fixture <-> Game (1:N)
Fixture_1.Fixture.hasMany(Game_1.Game, { foreignKey: 'fixtureId', as: 'games', onDelete: 'CASCADE' });
Game_1.Game.belongsTo(Fixture_1.Fixture, { foreignKey: 'fixtureId', as: 'fixture' });
// Game <-> GameParticipant (1:N)
Game_1.Game.hasMany(GameParticipant_1.GameParticipant, { foreignKey: 'gameId', as: 'participants', onDelete: 'CASCADE' });
GameParticipant_1.GameParticipant.belongsTo(Game_1.Game, { foreignKey: 'gameId', as: 'game' });
// User <-> GameParticipant (1:N)
User_1.User.hasMany(GameParticipant_1.GameParticipant, { foreignKey: 'userId', as: 'gameParticipations', onDelete: 'CASCADE' });
GameParticipant_1.GameParticipant.belongsTo(User_1.User, { foreignKey: 'userId', as: 'user' });
// Game <-> DraftTurn (1:N)
Game_1.Game.hasMany(DraftTurn_1.DraftTurn, { foreignKey: 'gameId', as: 'draftTurns', onDelete: 'CASCADE' });
DraftTurn_1.DraftTurn.belongsTo(Game_1.Game, { foreignKey: 'gameId', as: 'game' });
// GameParticipant <-> DraftTurn (1:N)
GameParticipant_1.GameParticipant.hasMany(DraftTurn_1.DraftTurn, { foreignKey: 'participantId', as: 'turns', onDelete: 'CASCADE' });
DraftTurn_1.DraftTurn.belongsTo(GameParticipant_1.GameParticipant, { foreignKey: 'participantId', as: 'participant' });
// Game <-> PlayerSelection (1:N)
Game_1.Game.hasMany(PlayerSelection_1.PlayerSelection, { foreignKey: 'gameId', as: 'playerSelections', onDelete: 'CASCADE' });
PlayerSelection_1.PlayerSelection.belongsTo(Game_1.Game, { foreignKey: 'gameId', as: 'game' });
// GameParticipant <-> PlayerSelection (1:N)
GameParticipant_1.GameParticipant.hasMany(PlayerSelection_1.PlayerSelection, { foreignKey: 'participantId', as: 'selections', onDelete: 'CASCADE' });
PlayerSelection_1.PlayerSelection.belongsTo(GameParticipant_1.GameParticipant, { foreignKey: 'participantId', as: 'participant' });
// Player <-> PlayerSelection (1:N)
Player_1.Player.hasMany(PlayerSelection_1.PlayerSelection, { foreignKey: 'playerId', as: 'selections', onDelete: 'CASCADE' });
PlayerSelection_1.PlayerSelection.belongsTo(Player_1.Player, { foreignKey: 'playerId', as: 'player' });
// Season <-> GlobalRanking (1:N)
Season_1.Season.hasMany(GlobalRanking_1.GlobalRanking, { foreignKey: 'seasonId', as: 'rankings', onDelete: 'CASCADE' });
GlobalRanking_1.GlobalRanking.belongsTo(Season_1.Season, { foreignKey: 'seasonId', as: 'season' });
// User <-> GlobalRanking (1:N)
User_1.User.hasMany(GlobalRanking_1.GlobalRanking, { foreignKey: 'userId', as: 'seasonRankings', onDelete: 'CASCADE' });
GlobalRanking_1.GlobalRanking.belongsTo(User_1.User, { foreignKey: 'userId', as: 'user' });
// User <-> Notification (1:N)
User_1.User.hasMany(Notification_1.Notification, { foreignKey: 'userId', as: 'notifications', onDelete: 'CASCADE' });
Notification_1.Notification.belongsTo(User_1.User, { foreignKey: 'userId', as: 'user' });
__exportStar(require("./Notification"), exports);
