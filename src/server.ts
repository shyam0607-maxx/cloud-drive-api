import { createApp } from "./app";
import { config, validateConfig } from "./config/env";

try {
  validateConfig();

  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully");
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });
} catch (error) {
  console.error("Failed to start server:", error);
  process.exit(1);
}
