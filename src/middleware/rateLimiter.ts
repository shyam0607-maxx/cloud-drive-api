import rateLimit from "express-rate-limit";

export const generalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: "Too many auth attempts, please try again later.",
  skipSuccessfulRequests: false,
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: "Too many uploads, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
