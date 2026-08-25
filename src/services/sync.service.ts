import { sequelize } from '../config/database';
import { Competition, Team, Fixture, Game, GameParticipant, Player } from '../models';
import { getFootballProvider } from '../infrastructure/football';
import { isSupportedCompetition, SUPPORTED_COMPETITIONS } from '../domain/competitions';
import { ScoringService } from './scoring.service';
import { GameService } from './game.service';
import { Op } from 'sequelize';

export class FootballSyncService {
  /**
   * Synchronizes supported competitions into the database idempotently
   */
  public static async syncCompetitions(): Promise<number> {
    const provider = getFootballProvider();
    const compDTOs = await provider.getCompetitions();

    let syncedCount = 0;

    for (const dto of compDTOs) {
      if (!isSupportedCompetition(dto.code)) {
        continue; // Skip non-supported competitions
      }

      const existingComp = await Competition.findOne({
        where: { code: dto.code },
      });

      if (existingComp) {
        await existingComp.update({
          name: dto.name,
          externalId: dto.externalId,
          logoUrl: dto.logoUrl || existingComp.logoUrl,
        });
      } else {
        await Competition.create({
          externalId: dto.externalId,
          name: dto.name,
          code: dto.code,
          logoUrl: dto.logoUrl || 'https://media.api-sports.io/football/leagues/default.png',
        });
      }
      syncedCount++;
    }

    return syncedCount;
  }

  /**
   * Synchronizes fixtures for supported competitions idempotently
   */
  public static async syncFixtures(competitionId?: string, status?: string): Promise<number> {
    const provider = getFootballProvider();
    const fixtureDTOs = await provider.getFixtures(competitionId, status);

    let syncedCount = 0;

    for (const dto of fixtureDTOs) {
      const compMeta = Object.values(SUPPORTED_COMPETITIONS).find(
        (c) => `comp-${c.code.toLowerCase()}` === dto.competitionId || c.code === dto.competitionId
      );

      if (!compMeta || !isSupportedCompetition(compMeta.code)) {
        continue; // Reject non-supported competition fixtures
      }

      const comp = await Competition.findOne({ where: { code: compMeta.code } });
      if (!comp) continue;

      // Find or create home team
      const [homeTeam] = await Team.findOrCreate({
        where: { externalId: parseInt(dto.homeTeam.id.replace('team-', ''), 10) || 1000 },
        defaults: {
          competitionId: comp.id,
          externalId: parseInt(dto.homeTeam.id.replace('team-', ''), 10) || 1000,
          name: dto.homeTeam.name,
          code: dto.homeTeam.code,
          logoUrl: dto.homeTeam.logoUrl || 'https://media.api-sports.io/teams/default.png',
        },
      });

      // Find or create away team
      const [awayTeam] = await Team.findOrCreate({
        where: { externalId: parseInt(dto.awayTeam.id.replace('team-', ''), 10) || 1001 },
        defaults: {
          competitionId: comp.id,
          externalId: parseInt(dto.awayTeam.id.replace('team-', ''), 10) || 1001,
          name: dto.awayTeam.name,
          code: dto.awayTeam.code,
          logoUrl: dto.awayTeam.logoUrl || 'https://media.api-sports.io/teams/default.png',
        },
      });

      // Upsert Fixture
      const existingFixture = await Fixture.findOne({ where: { externalId: dto.externalId } });

      if (existingFixture) {
        await existingFixture.update({
          status: dto.status,
          homeScore: dto.homeScore,
          awayScore: dto.awayScore,
          elapsed: dto.elapsed,
          startTime: dto.startTime,
        });
      } else {
        await Fixture.create({
          externalId: dto.externalId,
          competitionId: comp.id,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          status: dto.status,
          homeScore: dto.homeScore,
          awayScore: dto.awayScore,
          elapsed: dto.elapsed,
          startTime: dto.startTime,
        });
      }

      syncedCount++;
    }

    return syncedCount;
  }

  /**
   * Synchronizes events and statistics for active live fixtures, triggering room cancellation for unfilled/cancelled games
   */
  public static async syncLiveFixtures(): Promise<number> {
    const liveFixtures = await Fixture.findAll({
      where: {
        status: { [Op.in]: ['LIVE', 'HALFTIME', 'SCHEDULED'] },
      },
    });

    let updatedCount = 0;

    for (const fixture of liveFixtures) {
      // 1. Sync Events & Statistics if fixture is LIVE or HALFTIME
      if (fixture.status === 'LIVE' || fixture.status === 'HALFTIME') {
        await this.syncFixtureEvents(fixture.id);
        await this.syncPlayerStatistics(fixture.id);
        updatedCount++;
      }

      // 2. Unfilled Room Check: Match started (LIVE) but UFL Game room has < 4 participants -> CANCEL & REFUND
      const uflGames = await Game.findAll({
        where: { fixtureId: fixture.id, status: { [Op.notIn]: ['CANCELLED', 'FINISHED'] } },
        include: [{ model: GameParticipant, as: 'participants' }],
      });

      for (const game of uflGames) {
        const participants = (game.get('participants') as GameParticipant[]) || [];

        if (fixture.status === 'LIVE' && participants.length < 4) {
          console.log(`[Sync Engine] Game room ${game.id} has < 4 participants at match start. Cancelling & refunding 500 Coins.`);
          await GameService.cancelGame(game.id, 'UNFILLED_ROOM_AT_MATCH_START');
        } else if (fixture.status === 'CANCELLED' || fixture.status === 'POSTPONED') {
          console.log(`[Sync Engine] Fixture ${fixture.id} is ${fixture.status}. Cancelling UFL Game room ${game.id} & refunding.`);
          await GameService.cancelGame(game.id, 'MATCH_CANCELLED_OR_POSTPONED');
        } else if (fixture.status === 'SUSPENDED') {
          console.log(`[Sync Engine] Fixture ${fixture.id} is SUSPENDED. Keeping UFL Game room ${game.id} LIVE.`);
          // Keep game active (do not cancel)
        }
      }
    }

    return updatedCount;
  }

  /**
   * Synchronizes fixture events idempotently and passes them to ScoringService
   */
  public static async syncFixtureEvents(fixtureId: string): Promise<number> {
    const fixture = await Fixture.findByPk(fixtureId);
    if (!fixture) return 0;

    const provider = getFootballProvider();
    const events = await provider.getFixtureEvents(fixture.externalId.toString());

    let processedCount = 0;
    for (const evt of events) {
      // Resolve provider player external ID to internal Player ID if available
      if (evt.playerId) {
        const extPlayerId = parseInt(evt.playerId.replace('player-', ''), 10);
        const player = await Player.findOne({ where: { externalId: extPlayerId } });
        if (player) {
          evt.playerId = player.id;
        }
      }

      const res = await ScoringService.processFixtureEvent(fixture.id, evt);
      if (res.status === 'PROCESSED') {
        processedCount++;
      }
    }

    return processedCount;
  }

  /**
   * Synchronizes player match statistics idempotently and passes them to ScoringService
   */
  public static async syncPlayerStatistics(fixtureId: string): Promise<number> {
    const fixture = await Fixture.findByPk(fixtureId);
    if (!fixture) return 0;

    const provider = getFootballProvider();
    const statsList = await provider.getPlayerStatistics(fixture.externalId.toString());

    // Map external player IDs to internal Player IDs & ensure passes.key is NEVER mapped to Big Chance Created
    const mappedStatsList = [];
    for (const stat of statsList) {
      const extPlayerId = parseInt(stat.playerId.replace('player-', ''), 10);
      const player = await Player.findOne({ where: { externalId: extPlayerId } });

      if (player) {
        mappedStatsList.push({
          ...stat,
          playerId: player.id,
          bigChancesCreated: 0, // MUST remain 0 as key passes are NEVER mapped to Big Chance Created
        });
      }
    }

    if (mappedStatsList.length > 0) {
      await ScoringService.processPlayerMatchStatistics(fixture.id, mappedStatsList);
    }

    return mappedStatsList.length;
  }
}
