import {
  CompetitionDTO,
  FixtureDTO,
  FixtureEventDTO,
  PlayerMatchStatisticDTO,
} from '../../domain/dtos/football.dto';

export interface FootballProvider {
  getCompetitions(): Promise<CompetitionDTO[]>;
  getFixtures(competitionId?: string, status?: string): Promise<FixtureDTO[]>;
  getFixture(fixtureId: string): Promise<FixtureDTO | null>;
  getFixtureEvents(fixtureId: string): Promise<FixtureEventDTO[]>;
  getPlayerStatistics(fixtureId: string): Promise<PlayerMatchStatisticDTO[]>;
}
