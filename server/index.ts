import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { setupVite } from "./vite.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

const startServer = async (initialPort: number) => {
  try {
    // Set up routes first (API endpoints)
    const server = await registerRoutes(app);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error("Server error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    });

    if (process.env.NODE_ENV === "production") {
      const distPath = path.join(process.cwd(), "dist/public");
      console.log("[Static Files] Looking for static files in:", distPath);

      if (!fs.existsSync(distPath)) {
        throw new Error(
          `Could not find the build directory: ${distPath}, make sure to build the client first`
        );
      }

      app.use(express.static(distPath));

      // Serve index.html for all non-API routes in production
      app.get(/^(?!\/api).+/, (req, res) => {
        // Handle health checks
        if (req.headers["x-replit-healthcheck"]) {
          return res.status(200).json({ status: "ok" });
        }
        res.sendFile(path.join(distPath, "index.html"));
      });
    } else {
      // Development mode
      console.log("[Development] Setting up Vite middleware");
      await setupVite(app, server);
    }

    return new Promise((resolve, reject) => {
      const tryPort = (port: number) => {
        server
          .listen(port, "0.0.0.0")
          .once("error", (err: any) => {
            if (err.code === "EADDRINUSE") {
              console.log(`Port ${port} is in use, trying ${port + 1}`);
              tryPort(port + 1);
            } else {
              reject(err);
            }
          })
          .once("listening", () => {
            console.log(`Server is running on port ${port}`);
            resolve(server);
          });
      };

      tryPort(initialPort);
    });
  } catch (error) {
    console.error(`Error during server startup: ${error}`);
    throw error;
  }
};

// Start the server
(async () => {
  try {
    console.log('Starting server with configuration:');
    console.log('PORT:', process.env.PORT);
    console.log('NODE_ENV:', process.env.NODE_ENV);

    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
    await startServer(PORT);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();