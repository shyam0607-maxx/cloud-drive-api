import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { config } from "../config/env";
import { JWTPayload, RefreshTokenPayload, AuthTokens } from "../types";
import { v4 as uuidv4 } from "uuid";

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateAccessToken = (userId: string, email: string): string => {
  const payload: JWTPayload = {
    userId,
    email,
  };

  return jwt.sign(payload, config.jwt.secret!, {
    expiresIn: config.jwt.expiresIn,
  });
};

export const generateRefreshToken = (userId: string): string => {
  const tokenFamily = uuidv4();
  const payload: RefreshTokenPayload = {
    userId,
    tokenFamily,
  };

  return jwt.sign(payload, config.refresh.secret!, {
    expiresIn: config.refresh.expiresIn,
  });
};

export const verifyAccessToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret!) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload | null => {
  try {
    const decoded = jwt.verify(token, config.refresh.secret!) as RefreshTokenPayload;
    return decoded;
  } catch {
    return null;
  }
};

export const generateAuthTokens = (userId: string, email: string): AuthTokens => {
  return {
    accessToken: generateAccessToken(userId, email),
    refreshToken: generateRefreshToken(userId),
  };
};
