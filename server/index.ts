import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";
import { storage } from "./storage";
import dotenv from "dotenv";
dotenv.config()

const app = express();
// Enable trust proxy - needed for express-rate-limit to work correctly with Replit
app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Initialize routes
(async () => {
  const server = await registerRoutes(app, storage);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error(err);
  });

  // Only setup routes if we're in development
  if (process.env.NODE_ENV !== 'production') {
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Only start server if not being imported for Firebase Functions
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
      const port = 5000;
      server.listen(port, "0.0.0.0", () => {
        log(`serving on port ${port}`);
      });
    }
  } else {
    // In production, just serve the static files
    serveStatic(app);
  }
})();

// Export the Express application
export default app;
