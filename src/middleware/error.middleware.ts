import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/response';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    console.error('[Error Handler] Validation Error:', err.errors);
    sendError(res, 'VALIDATION_ERROR', 'Invalid request parameters', 400, err.errors);
    return;
  }

  console.error('[Error Handler]', err);

  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected internal error occurred';

  sendError(res, errorCode, message, statusCode);
}
