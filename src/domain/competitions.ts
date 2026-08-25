export type SupportedCompetitionCode = 'EPL' | 'LALIGA' | 'SPL' | 'UCL' | 'ACL';

export interface SupportedCompetitionMetadata {
  code: SupportedCompetitionCode;
  name: string;
  externalId: number; // API-Football League ID mapping
  country?: string;
  logoUrl: string;
}

export const SUPPORTED_COMPETITIONS: Record<SupportedCompetitionCode, SupportedCompetitionMetadata> = {
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
};

export const SUPPORTED_COMPETITION_CODES: SupportedCompetitionCode[] = ['EPL', 'LALIGA', 'SPL', 'UCL', 'ACL'];

export function isSupportedCompetition(code: string): code is SupportedCompetitionCode {
  return SUPPORTED_COMPETITION_CODES.includes(code as SupportedCompetitionCode);
}
