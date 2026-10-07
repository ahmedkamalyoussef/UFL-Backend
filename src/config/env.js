"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().transform((val) => parseInt(val, 10)).default('3000'),
    DB_NAME: zod_1.z.string().default('ufl'),
    DB_USER: zod_1.z.string().default('root'),
    DB_PASS: zod_1.z.string().default('41468158'),
    DB_HOST: zod_1.z.string().default('localhost'),
    DB_PORT: zod_1.z.string().transform((val) => parseInt(val, 10)).default('3306'),
    JWT_SECRET: zod_1.z.string().default('ufl-jwt-super-secret-key-2026'),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    API_FOOTBALL_BASE_URL: zod_1.z.string().default('https://v3.football.api-sports.io'),
    API_FOOTBALL_KEY: zod_1.z.string().default(''),
});
exports.env = envSchema.parse(process.env);
