import { FootballProvider } from './football-provider.interface';
import {
  CompetitionDTO,
  FixtureDTO,
  FixtureEventDTO,
  PlayerMatchStatisticDTO,
} from '../../domain/dtos/football.dto';
import { env } from '../../config/env';
import { SUPPORTED_COMPETITIONS, isSupportedCompetition } from '../../domain/competitions';

export class ApiFootballProvider implements FootballProvider {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = env.API_FOOTBALL_BASE_URL;
    this.apiKey = env.API_FOOTBALL_KEY;
  }

  private isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public async getCompetitions(): Promise<CompetitionDTO[]> {
    if (!this.isConfigured()) {
      console.warn('[ApiFootballProvider] API_FOOTBALL_KEY is not configured.');
      return Object.values(SUPPORTED_COMPETITIONS).map((comp) => ({
        id: `comp-${comp.code.toLowerCase()}`,
        externalId: comp.externalId,
        name: comp.name,
        code: comp.code,
        logoUrl: comp.logoUrl,
      }));
    }

    // Structural template ready for real API-Football integration when API key is provided
    throw new Error('API-Football integration is ready but live requests are disabled during initial Phase 7 setup.');
  }

  public async getFixtures(competitionId?: string, status?: string): Promise<FixtureDTO[]> {
    if (!this.isConfigured()) {
      console.warn('[ApiFootballProvider] API_FOOTBALL_KEY is not configured. Returning empty fixture list.');
      return [];
    }

    return [];
  }

  public async getFixture(fixtureId: string): Promise<FixtureDTO | null> {
    if (!this.isConfigured()) {
      console.warn('[ApiFootballProvider] API_FOOTBALL_KEY is not configured.');
      return null;
    }

    return null;
  }

  public async getFixtureEvents(fixtureId: string): Promise<FixtureEventDTO[]> {
    if (!this.isConfigured()) {
      return [];
    }

    return [];
  }

  public async getPlayerStatistics(fixtureId: string): Promise<PlayerMatchStatisticDTO[]> {
    if (!this.isConfigured()) {
      return [];
    }

    return [];
  }
}
