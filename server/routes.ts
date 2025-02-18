import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertPropertySchema, insertApplicationSchema, insertUserSchema } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { sql } from "drizzle-orm";
import multer from "multer";
import path from "path";
import express from 'express';
import fs from 'fs';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create test accounts if they don't exist
  const testLandlord = await storage.getUserByUsername("testlandlord");
  if (!testLandlord) {
    await storage.createUser({
      username: "testlandlord",
      password: "testlandlord",
      type: "landlord",
      name: "Test Landlord",
      email: "testlandlord@example.com",
      phone: "1234567890"
    });
  }

  const testTenant = await storage.getUserByUsername("testtenant");
  if (!testTenant) {
    await storage.createUser({
      username: "testtenant",
      password: "testtenant",
      type: "tenant",
      name: "Test Tenant",
      email: "testtenant@example.com",
      phone: "0987654321"
    });
  }

  setupAuth(app);

  // Add authentication debugging middleware
  app.use((req, res, next) => {
    console.log(`[Auth Debug] ${req.method} ${req.path}`);
    console.log(`[Auth Debug] isAuthenticated: ${req.isAuthenticated()}`);
    if (req.user) {
      console.log(`[Auth Debug] User: ${JSON.stringify(req.user)}`);
    }
    next();
  });

  // Create uploads directory if it doesn't exist
  if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
  }

  // Image upload route
  app.post("/api/upload", upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Property routes
  app.get("/api/properties", async (req, res) => {
    console.log("[Property Debug] GET /api/properties");
    console.log("[Property Debug] User authenticated:", req.isAuthenticated());
    console.log("[Property Debug] User:", req.user);

    if (!req.isAuthenticated()) {
      console.log("[Property Debug] User not authenticated");
      return res.sendStatus(401);
    }

    try {
      const properties = await storage.getAllProperties();
      console.log("[Property Debug] Retrieved properties:", properties);
      res.json(properties);
    } catch (error) {
      console.error("[Property Debug] Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.post("/api/properties", async (req, res) => {
    console.log("[Property Debug] Request body:", req.body);
    console.log("[Property Debug] User authentication status:", req.isAuthenticated());
    console.log("[Property Debug] User:", req.user);

    if (!req.isAuthenticated()) {
      console.log("[Property Debug] Not authenticated");
      return res.sendStatus(401);
    }

    if (req.user.type !== "landlord") {
      console.log("[Property Debug] Not a landlord");
      return res.status(403).json({ message: "Only landlords can create properties" });
    }

    const validation = insertPropertySchema.safeParse(req.body);
    if (!validation.success) {
      console.log("[Property Debug] Validation failed:", validation.error);
      return res.status(400).json(validation.error);
    }

    try {
      const property = await storage.createProperty({
        ...validation.data,
        landlordId: req.user.id,
        status: "Available",
        available: true,
        pageViews: 0,
        uniqueVisitors: 0,
        submissionCount: 0
      });
      res.status(201).json(property);
    } catch (error) {
      console.error("Failed to create property:", error);
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  // Track RentCard view
  app.post("/api/rentcard/:id/view", async (req, res) => {
    if (!req.isAuthenticated() || req.user.type !== "landlord") {
      return res.sendStatus(403);
    }
    const rentCardId = parseInt(req.params.id);
    const viewRecord = await storage.createRentCardView({
      rentCardId,
      landlordId: req.user.id,
      viewedAt: new Date()
    });
    res.status(201).json(viewRecord);
  });

  // Track property page view
  app.post("/api/properties/:id/view", async (req, res) => {
    const propertyId = parseInt(req.params.id);
    await storage.incrementPropertyViews(propertyId);
    res.sendStatus(200);
  });

  // Application routes
  app.get("/api/applications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    let applications;
    if (req.user.type === "tenant") {
      applications = await storage.getTenantApplications(req.user.id);
    } else if (req.user.type === "landlord") {
      applications = await storage.getLandlordApplications(req.user.id);
    } else {
      return res.sendStatus(403);
    }

    res.json(applications);
  });

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
      message: validation.data.message || null
    });

    // Increment submission count for the property
    await storage.incrementPropertySubmissions(validation.data.propertyId);

    res.status(201).json(application);
  });

  const httpServer = createServer(app);
  return httpServer;
}