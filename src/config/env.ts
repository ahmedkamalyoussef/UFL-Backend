import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('3000'),
  DB_NAME: z.string().default('ufl'),
  DB_USER: z.string().default('root'),
  DB_PASS: z.string().default('41468158'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().transform((val) => parseInt(val, 10)).default('3306'),
  JWT_SECRET: z.string().default('ufl-jwt-super-secret-key-2026'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  API_FOOTBALL_BASE_URL: z.string().default('https://v3.football.api-sports.io'),
  API_FOOTBALL_KEY: z.string().default(''),
});

export const env = envSchema.parse(process.env);
