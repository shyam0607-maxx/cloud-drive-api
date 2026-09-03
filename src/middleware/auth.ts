import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/auth";
import { ErrorResponses } from "../utils/errors";

export interface AuthRequest extends Request {
  userId?: string;
  email?: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      error: {
        code: ErrorResponses.unauthorized.code,
        message: ErrorResponses.unauthorized.message,
      },
    });
  }

  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(401).json({
      error: {
        code: ErrorResponses.unauthorized.code,
        message: ErrorResponses.unauthorized.message,
      },
    });
  }

  req.userId = decoded.userId;
  req.email = decoded.email;
  next();
};

export const optionalAuthMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (token) {
    const decoded = verifyAccessToken(token);
    if (decoded) {
      req.userId = decoded.userId;
      req.email = decoded.email;
    }
  }

  next();
};
