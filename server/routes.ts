import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertPropertySchema, insertApplicationSchema, insertUserSchema } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Create sample tenant user if it doesn't exist
  const existingUser = await storage.getUserByUsername("test");
  if (!existingUser) {
    await storage.createUser({
      username: "test",
      password: await hashPassword("test"),
      type: "tenant",
      name: "Test User",
      email: "test@example.com",
      phone: "555-0123"
    });
  }

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