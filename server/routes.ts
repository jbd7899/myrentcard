import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertPropertySchema, insertApplicationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Property routes
  app.get("/api/properties", async (req, res) => {
    const properties = await storage.getAllProperties();
    res.json(properties);
  });

  app.post("/api/properties", async (req, res) => {
    if (!req.isAuthenticated() || req.user.type !== "landlord") {
      return res.sendStatus(403);
    }

    const validation = insertPropertySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validation.error);
    }

    const property = await storage.createProperty({
      ...validation.data,
      landlordId: req.user.id,
    });
    res.status(201).json(property);
  });

  // Application routes
  app.post("/api/applications", async (req, res) => {
    if (!req.isAuthenticated() || req.user.type !== "tenant") {
      return res.sendStatus(403);
    }

    const validation = insertApplicationSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validation.error);
    }

    const application = await storage.createApplication({
      ...validation.data,
      tenantId: req.user.id,
      status: "pending",
    });
    res.status(201).json(application);
  });

  app.get("/api/applications/tenant", async (req, res) => {
    if (!req.isAuthenticated() || req.user.type !== "tenant") {
      return res.sendStatus(403);
    }

    const applications = await storage.getTenantApplications(req.user.id);
    res.json(applications);
  });

  app.get("/api/applications/landlord", async (req, res) => {
    if (!req.isAuthenticated() || req.user.type !== "landlord") {
      return res.sendStatus(403);
    }

    const applications = await storage.getLandlordApplications(req.user.id);
    res.json(applications);
  });

  const httpServer = createServer(app);
  return httpServer;
}
