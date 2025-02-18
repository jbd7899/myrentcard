import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";

const app = express();
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

const startServer = async (initialPort: number) => {
  try {
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      throw err;
    });

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      app.use(express.static('dist/public'));
      app.get('*', (req, res) => {
        res.sendFile('dist/public/index.html', { root: '.' });
      });
    }

    return new Promise((resolve, reject) => {
      const tryPort = (port: number) => {
        server.listen(port, "0.0.0.0")
          .on('error', (err: any) => {
            if (err.code === 'EADDRINUSE') {
              log(`Port ${port} is in use, trying ${port + 1}`);
              tryPort(port + 1);
            } else {
              reject(err);
            }
          })
          .on('listening', () => {
            log(`serving on port ${port}`);
            resolve(server);
          });
      };

      tryPort(initialPort);
    });
  } catch (error) {
    log(`Error during server startup: ${error}`);
    throw error;
  }
};

(async () => {
  try {
    const PORT = parseInt(process.env.PORT || "5000", 10);
    await startServer(PORT);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();