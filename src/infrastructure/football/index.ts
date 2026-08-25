import { FootballProvider } from './football-provider.interface';
import { ApiFootballProvider } from './api-football.provider';

let providerInstance: FootballProvider | null = null;

export function getFootballProvider(): FootballProvider {
  if (!providerInstance) {
    providerInstance = new ApiFootballProvider();
  }
  return providerInstance;
}

export function setFootballProvider(provider: FootballProvider): void {
  providerInstance = provider;
}

export * from './football-provider.interface';
export * from './api-football.provider';
export * from './api-football-client';
