import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { setupVite } from "./vite.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
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

      console.log(logLine);
    }
  });

  next();
});

const startServer = async (initialPort: number) => {
  try {
    const server = await registerRoutes(app);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      console.error("Server error:", err);
    });

    if (process.env.NODE_ENV === "production") {
      const distPath = path.join(process.cwd(), "dist/client");
      console.log("[Static Files] Looking for static files in:", distPath);
      console.log("[Static Files] Current directory:", process.cwd());
      console.log("[Static Files] Directory exists:", fs.existsSync(distPath));

      if (!fs.existsSync(distPath)) {
        console.error("[Static Files] Build directory not found:", distPath);
        throw new Error(
          `Could not find the build directory: ${distPath}, make sure to build the client first`,
        );
      }

      app.use(express.static(distPath));

      app.get("*", (req, res) => {
        const indexPath = path.join(distPath, "index.html");
        console.log("[Static Files] Serving index.html for path:", req.path);
        console.log("[Static Files] From location:", indexPath);
        if (!fs.existsSync(indexPath)) {
          console.error("[Static Files] index.html not found at:", indexPath);
          return res.status(404).send("Application not properly built");
        }
        res.sendFile(indexPath);
      });
    } else {
      await setupVite(app, server);
    }

    let currentPort = initialPort;
    const maxRetries = 10;

    const tryListen = (port: number, retryCount = 0): Promise<import('http').Server> => {
      return new Promise((resolve, reject) => {
        const onError = (err: any) => {
          if (err.code === 'EADDRINUSE' && retryCount < maxRetries) {
            console.log(`Port ${port} is in use, trying ${port + 1}`);
            server.removeListener('error', onError);
            tryListen(port + 1, retryCount + 1)
              .then(resolve)
              .catch(reject);
          } else {
            reject(err);
          }
        };

        server.once('error', onError);

        server.listen(port, "0.0.0.0", () => {
          console.log(`Server is running on port ${port}`);
          resolve(server);
        });
      });
    };

    return tryListen(currentPort);
  } catch (error) {
    console.error(`Error during server startup: ${error}`);
    throw error;
  }
};

(async () => {
  try {
    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
    await startServer(PORT);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();