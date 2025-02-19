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

// Debug route to check environment and paths
app.get("/debug", (req, res) => {
  res.json({
    env: process.env.NODE_ENV,
    cwd: process.cwd(),
    distPath: path.join(process.cwd(), "dist/public"),
    distExists: fs.existsSync(path.join(process.cwd(), "dist/public")),
    nodeVersion: process.version,
    uptime: process.uptime()
  });
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
      const distPath = path.join(process.cwd(), "dist/public");
      console.log("[Static Files] Production mode detected");
      console.log("[Static Files] Looking for static files in:", distPath);
      console.log("[Static Files] Current directory:", process.cwd());
      console.log("[Static Files] Directory exists:", fs.existsSync(distPath));

      if (!fs.existsSync(distPath)) {
        console.error("[Static Files] Build directory not found:", distPath);
        throw new Error(
          `Could not find the build directory: ${distPath}, make sure to build the client first`,
        );
      }

      // Serve static files from the assets directory
      app.use("/assets", express.static(path.join(distPath, "assets")));

      // Serve other static files from the root
      app.use(express.static(distPath));

      // Add a route to verify static file serving
      app.get("/static-check", (req, res) => {
        const files = fs.readdirSync(distPath);
        res.json({
          distExists: fs.existsSync(distPath),
          files: files,
          distPath: distPath
        });
      });

      // Handle all other routes by serving index.html
      app.get("*", (req, res) => {
        const indexPath = path.join(distPath, "index.html");
        console.log("[Static Files] Serving index.html for:", req.path);
        console.log("[Static Files] From location:", indexPath);

        if (!fs.existsSync(indexPath)) {
          console.error("[Static Files] index.html not found at:", indexPath);
          return res.status(404).send("Application not properly built");
        }
        res.sendFile(indexPath);
      });
    } else {
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

    // Use PORT from environment variable, default to 5000 for production
    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
    await startServer(PORT);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();