import { SupportedCompetitionCode } from '../competitions';

export interface CompetitionDTO {
  id: string;
  externalId: number;
  name: string;
  code: SupportedCompetitionCode;
  logoUrl?: string;
}

export interface TeamDTO {
  id: string;
  externalId: number;
  competitionId: string;
  name: string;
  code: string;
  logoUrl: string;
}

export interface PlayerDTO {
  id: string;
  externalId: number;
  teamId: string;
  name: string;
  position: 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'ATTACKER';
  photoUrl: string;
  isStar: boolean;
  avgPoints: number;
}

export interface FixtureDTO {
  id: string;
  externalId: number;
  competitionId: string;
  homeTeam: { id: string; name: string; code: string; logoUrl: string };
  awayTeam: { id: string; name: string; code: string; logoUrl: string };
  homeScore: number;
  awayScore: number;
  elapsed: number;
  status: 'SCHEDULED' | 'LIVE' | 'HALFTIME' | 'FINISHED' | 'CANCELLED' | 'SUSPENDED' | 'POSTPONED';
  startTime: Date;
}

export interface FixtureEventDTO {
  externalEventId?: string;
  fixtureId: string;
  playerId?: string;
  eventType: 'GOAL' | 'ASSIST' | 'PASS' | 'TACKLE' | 'YELLOW_CARD' | 'RED_CARD' | 'SAVE' | 'CLEAN_SHEET';
  minute: number;
  detail?: string;
}

export interface PlayerMatchStatisticDTO {
  fixtureId: string;
  playerId: string;
  name: string;
  position: 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'ATTACKER';
  goals: number;
  assists: number;
  bigChancesCreated: number; // MUST be 0/null unless provider explicitly supplies it
  successfulPasses: number;
  failedPasses: number;
  tackles: number;
  yellowCards: number;
  redCards: number;
  cleanSheet: boolean; // Played >= 60m AND 0 conceded on pitch
  saves: number;
  minutesPlayed: number;
  totalFantasyPoints: number;
}
