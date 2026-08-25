import { User } from './User';
import { Wallet } from './Wallet';
import { WalletTransaction } from './WalletTransaction';
import { Competition } from './Competition';
import { Team } from './Team';
import { Player } from './Player';
import { Fixture } from './Fixture';
import { FixtureEvent } from './FixtureEvent';
import { PlayerMatchStatistic } from './PlayerMatchStatistic';
import { Game } from './Game';
import { GameParticipant } from './GameParticipant';
import { DraftTurn } from './DraftTurn';
import { PlayerSelection } from './PlayerSelection';
import { Season } from './Season';
import { GlobalRanking } from './GlobalRanking';
import { Notification } from './Notification';

// -------------------------------------------------------------
// Model Associations Definition
// -------------------------------------------------------------

// User <-> Wallet (1:1)
User.hasOne(Wallet, { foreignKey: 'userId', as: 'wallet', onDelete: 'CASCADE' });
Wallet.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Wallet <-> WalletTransaction (1:N)
Wallet.hasMany(WalletTransaction, { foreignKey: 'walletId', as: 'transactions', onDelete: 'CASCADE' });
WalletTransaction.belongsTo(Wallet, { foreignKey: 'walletId', as: 'wallet' });

// User <-> WalletTransaction (shortcut association)
User.hasMany(WalletTransaction, { foreignKey: 'walletId', sourceKey: 'id', as: 'transactions' });

// Competition <-> Team (1:N)
Competition.hasMany(Team, { foreignKey: 'competitionId', as: 'teams', onDelete: 'CASCADE' });
Team.belongsTo(Competition, { foreignKey: 'competitionId', as: 'competition' });

// Competition <-> Fixture (1:N)
Competition.hasMany(Fixture, { foreignKey: 'competitionId', as: 'fixtures', onDelete: 'CASCADE' });
Fixture.belongsTo(Competition, { foreignKey: 'competitionId', as: 'competition' });

// Team <-> Player (1:N)
Team.hasMany(Player, { foreignKey: 'teamId', as: 'players', onDelete: 'CASCADE' });
Player.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

// Team <-> Fixture (Home / Away Teams)
Team.hasMany(Fixture, { foreignKey: 'homeTeamId', as: 'homeFixtures' });
Team.hasMany(Fixture, { foreignKey: 'awayTeamId', as: 'awayFixtures' });
Fixture.belongsTo(Team, { foreignKey: 'homeTeamId', as: 'homeTeam' });
Fixture.belongsTo(Team, { foreignKey: 'awayTeamId', as: 'awayTeam' });

// Fixture <-> FixtureEvent (1:N)
Fixture.hasMany(FixtureEvent, { foreignKey: 'fixtureId', as: 'events', onDelete: 'CASCADE' });
FixtureEvent.belongsTo(Fixture, { foreignKey: 'fixtureId', as: 'fixture' });

// Player <-> FixtureEvent (1:N)
Player.hasMany(FixtureEvent, { foreignKey: 'playerId', as: 'events', onDelete: 'SET NULL' });
FixtureEvent.belongsTo(Player, { foreignKey: 'playerId', as: 'player' });

// Fixture <-> PlayerMatchStatistic (1:N)
Fixture.hasMany(PlayerMatchStatistic, { foreignKey: 'fixtureId', as: 'playerStatistics', onDelete: 'CASCADE' });
PlayerMatchStatistic.belongsTo(Fixture, { foreignKey: 'fixtureId', as: 'fixture' });

// Player <-> PlayerMatchStatistic (1:N)
Player.hasMany(PlayerMatchStatistic, { foreignKey: 'playerId', as: 'matchStatistics', onDelete: 'CASCADE' });
PlayerMatchStatistic.belongsTo(Player, { foreignKey: 'playerId', as: 'player' });

// Fixture <-> Game (1:N)
Fixture.hasMany(Game, { foreignKey: 'fixtureId', as: 'games', onDelete: 'CASCADE' });
Game.belongsTo(Fixture, { foreignKey: 'fixtureId', as: 'fixture' });

// Game <-> GameParticipant (1:N)
Game.hasMany(GameParticipant, { foreignKey: 'gameId', as: 'participants', onDelete: 'CASCADE' });
GameParticipant.belongsTo(Game, { foreignKey: 'gameId', as: 'game' });

// User <-> GameParticipant (1:N)
User.hasMany(GameParticipant, { foreignKey: 'userId', as: 'gameParticipations', onDelete: 'CASCADE' });
GameParticipant.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Game <-> DraftTurn (1:N)
Game.hasMany(DraftTurn, { foreignKey: 'gameId', as: 'draftTurns', onDelete: 'CASCADE' });
DraftTurn.belongsTo(Game, { foreignKey: 'gameId', as: 'game' });

// GameParticipant <-> DraftTurn (1:N)
GameParticipant.hasMany(DraftTurn, { foreignKey: 'participantId', as: 'turns', onDelete: 'CASCADE' });
DraftTurn.belongsTo(GameParticipant, { foreignKey: 'participantId', as: 'participant' });

// Game <-> PlayerSelection (1:N)
Game.hasMany(PlayerSelection, { foreignKey: 'gameId', as: 'playerSelections', onDelete: 'CASCADE' });
PlayerSelection.belongsTo(Game, { foreignKey: 'gameId', as: 'game' });

// GameParticipant <-> PlayerSelection (1:N)
GameParticipant.hasMany(PlayerSelection, { foreignKey: 'participantId', as: 'selections', onDelete: 'CASCADE' });
PlayerSelection.belongsTo(GameParticipant, { foreignKey: 'participantId', as: 'participant' });

// Player <-> PlayerSelection (1:N)
Player.hasMany(PlayerSelection, { foreignKey: 'playerId', as: 'selections', onDelete: 'CASCADE' });
PlayerSelection.belongsTo(Player, { foreignKey: 'playerId', as: 'player' });

// Season <-> GlobalRanking (1:N)
Season.hasMany(GlobalRanking, { foreignKey: 'seasonId', as: 'rankings', onDelete: 'CASCADE' });
GlobalRanking.belongsTo(Season, { foreignKey: 'seasonId', as: 'season' });

// User <-> GlobalRanking (1:N)
User.hasMany(GlobalRanking, { foreignKey: 'userId', as: 'seasonRankings', onDelete: 'CASCADE' });
GlobalRanking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Notification (1:N)
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export {
  User,
  Wallet,
  WalletTransaction,
  Competition,
  Team,
  Player,
  Fixture,
  FixtureEvent,
  PlayerMatchStatistic,
  Game,
  GameParticipant,
  DraftTurn,
  PlayerSelection,
  Season,
  GlobalRanking,
  Notification,
};

export * from './Notification';
