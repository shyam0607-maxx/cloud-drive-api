import express, { Application, Response } from "express";
import cors from "cors";
import { config } from "./config/env";
import { errorHandler } from "./middleware/error";
import { generalLimiter, authLimiter, uploadLimiter } from "./middleware/rateLimiter";
import authRoutes from "./routes/auth";
import folderRoutes from "./routes/folders";
import fileRoutes from "./routes/files";
import shareRoutes from "./routes/shares";
import trashRoutes from "./routes/trash";
import starsRoutes from "./routes/stars";
import activitiesRoutes from "./routes/activities";
import searchRoutes from "./routes/search";
import "express-async-errors";

export const createApp = (): Application => {
  const app = express();

  // Security headers middleware
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https:;"
    );
    next();
  });

  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
    })
  );

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Apply rate limiting
  app.use("/api/", generalLimiter);
  app.use("/api/auth/", authLimiter);
  app.use("/api/files/init", uploadLimiter);

  app.get("/health", (req, res: Response) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/folders", folderRoutes);
  app.use("/api/files", fileRoutes);
  app.use("/api/shares", shareRoutes);
  app.use("/api/trash", trashRoutes);
  app.use("/api/stars", starsRoutes);
  app.use("/api/activities", activitiesRoutes);
  app.use("/api/search", searchRoutes);

  app.use((req, res) => {
    res.status(404).json({
      error: { code: "NOT_FOUND", message: "Endpoint not found" },
    });
  });

  app.use(errorHandler);

  return app;
};
