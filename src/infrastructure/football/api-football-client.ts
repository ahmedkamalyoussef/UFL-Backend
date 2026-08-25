import { env } from '../../config/env';

export class ApiFootballClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number = 10000;

  constructor(baseUrl?: string, apiKey?: string) {
    this.baseUrl = baseUrl !== undefined ? baseUrl : env.API_FOOTBALL_BASE_URL;
    this.apiKey = apiKey !== undefined ? apiKey : env.API_FOOTBALL_KEY;
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public async get<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
    if (!this.isConfigured()) {
      throw {
        code: 'FOOTBALL_PROVIDER_NOT_CONFIGURED',
        message: 'API_FOOTBALL_KEY is not configured in environment variables',
        statusCode: 503,
      };
    }

    const url = new URL(endpoint, this.baseUrl);
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        url.searchParams.append(key, String(val));
      }
    });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'x-apisports-key': this.apiKey,
          'x-rapidapi-key': this.apiKey,
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (response.status === 429) {
        throw {
          code: 'FOOTBALL_PROVIDER_RATE_LIMITED',
          message: 'API-Football rate limit reached (429 Too Many Requests)',
          statusCode: 429,
        };
      }

      if (!response.ok) {
        throw {
          code: 'FOOTBALL_PROVIDER_UNAVAILABLE',
          message: `API-Football returned HTTP status ${response.status}`,
          statusCode: 503,
        };
      }

      const json: any = await response.json();

      // Handle API-Football internal error payloads
      if (json && json.errors && Object.keys(json.errors).length > 0) {
        const errorMsg = typeof json.errors === 'string' ? json.errors : JSON.stringify(json.errors);
        if (errorMsg.toLowerCase().includes('rate limit')) {
          throw {
            code: 'FOOTBALL_PROVIDER_RATE_LIMITED',
            message: `API-Football rate limit: ${errorMsg}`,
            statusCode: 429,
          };
        }
        if (errorMsg.toLowerCase().includes('token') || errorMsg.toLowerCase().includes('key')) {
          throw {
            code: 'FOOTBALL_PROVIDER_UNAVAILABLE',
            message: 'API-Football credential authentication error',
            statusCode: 503,
          };
        }
      }

      if (!json || typeof json !== 'object' || json.response === undefined) {
        throw {
          code: 'FOOTBALL_PROVIDER_INVALID_RESPONSE',
          message: 'API-Football returned malformed payload missing response field',
          statusCode: 502,
        };
      }

      return json as T;
    } catch (err: any) {
      clearTimeout(timer);

      if (err.name === 'AbortError') {
        throw {
          code: 'FOOTBALL_PROVIDER_TIMEOUT',
          message: `API-Football request timed out after ${this.timeoutMs}ms`,
          statusCode: 504,
        };
      }

      if (err.code && err.code.startsWith('FOOTBALL_PROVIDER_')) {
        throw err;
      }

      // Sanitize log output to prevent API key leaks
      console.error('[ApiFootballClient Error]', err.message || 'Unknown network failure');
      throw {
        code: 'FOOTBALL_PROVIDER_UNAVAILABLE',
        message: 'Failed to communicate with API-Football service',
        statusCode: 503,
      };
    }
  }
}
