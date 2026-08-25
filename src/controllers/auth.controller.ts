import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { AuthService } from '../services/auth.service';
import { sendSuccess } from '../utils/response';

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = registerSchema.parse(req.body);
      const data = await AuthService.register(validatedInput);
      sendSuccess(res, data, 201);
    } catch (error) {
      next(error);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = loginSchema.parse(req.body);
      const data = await AuthService.login(validatedInput);
      sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }
}
