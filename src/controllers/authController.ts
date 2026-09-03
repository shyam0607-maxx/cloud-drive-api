import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { authService } from "../services/authService";
import { registerSchema, loginSchema } from "../validators/auth";

export class AuthController {
  async register(req: AuthRequest, res: Response) {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);

    res.status(201).json({
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  }

  async login(req: AuthRequest, res: Response) {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);

    res.status(200).json({
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  }

  async getMe(req: AuthRequest, res: Response) {
    if (!req.userId) {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Not authenticated" },
      });
    }

    const user = await authService.getProfile(req.userId);
    res.json({ user });
  }

  async logout(req: AuthRequest, res: Response) {
    res.json({ message: "Logged out successfully" });
  }
}

export const authController = new AuthController();
