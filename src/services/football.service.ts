import { Competition, Fixture, Team } from '../models';
import { SUPPORTED_COMPETITIONS, isSupportedCompetition } from '../domain/competitions';
import { Op } from 'sequelize';

export class FootballService {
  public static async getCompetitions() {
    // Return all 5 supported competitions from database or whitelist
    const dbCompetitions = await Competition.findAll({
      where: {
        code: {
          [Op.in]: Object.keys(SUPPORTED_COMPETITIONS),
        },
      },
    });

    if (dbCompetitions.length > 0) {
      return dbCompetitions.filter((c) => isSupportedCompetition(c.code));
    }

    // Fallback to static supported whitelist if DB not seeded
    return Object.values(SUPPORTED_COMPETITIONS);
  }

  public static async getMatches(status?: string, competitionId?: string) {
    const whereClause: any = {};

    if (status) {
      whereClause.status = status.toUpperCase();
    }
    if (competitionId) {
      whereClause.competitionId = competitionId;
    }

    const fixtures = await Fixture.findAll({
      where: whereClause,
      include: [
        { model: Competition, as: 'competition' },
        { model: Team, as: 'homeTeam' },
        { model: Team, as: 'awayTeam' },
      ],
      order: [['startTime', 'ASC']],
    });

    // Filter strictly by supported competition whitelist
    return fixtures.filter(
      (f) => f.get('competition') && isSupportedCompetition((f.get('competition') as Competition).code)
    );
  }

  public static async getMatchById(fixtureId: string) {
    const fixture = await Fixture.findByPk(fixtureId, {
      include: [
        { model: Competition, as: 'competition' },
        { model: Team, as: 'homeTeam' },
        { model: Team, as: 'awayTeam' },
      ],
    });

    if (!fixture) {
      throw { code: 'MATCH_NOT_FOUND', message: 'Match fixture not found', statusCode: 404 };
    }

    const comp = fixture.get('competition') as Competition | null;
    if (!comp || !isSupportedCompetition(comp.code)) {
      throw { code: 'UNSUPPORTED_COMPETITION', message: 'Match belongs to an unsupported competition', statusCode: 400 };
    }

    return fixture;
  }
}
