import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertPropertySchema, insertApplicationSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import express from 'express';
import fs from 'fs';

export async function registerRoutes(app: Express): Promise<Server> {
  try {
    // Check if test account already exists
    const existingTestUser = await storage.getUserByUsername("test1");
    if (!existingTestUser) {
      console.log("[Debug] No test account found, creating test accounts...");

      // Create test landlord
      const testLandlord = await storage.createUser({
        username: "test1",
        password: "test1",
        type: "landlord",
        name: "Test Landlord 1",
        email: "test1@example.com",
        phone: "1234567890"
      });
      console.log("[Debug] Created test landlord:", testLandlord);

      // Create test properties
      const property1 = await storage.createProperty({
        title: "Luxury Downtown Apartment",
        description: "Modern 2-bedroom apartment in the heart of downtown",
        address: "123 Main St",
        units: 4,
        parkingSpaces: 2,
        landlordId: testLandlord.id,
        status: "Available" as const,
        available: true
      });

      const property2 = await storage.createProperty({
        title: "Suburban Family Home",
        description: "Spacious 3-bedroom house with garden",
        address: "456 Oak Ave",
        units: 1,
        parkingSpaces: 2,
        landlordId: testLandlord.id,
        status: "Available" as const,
        available: true
      });

      // Create some test applications
      const testApplications = [
        {
          propertyId: property1.id,
          tenantId: 999,
          status: "pending" as const,
          message: "Interested in moving in next month"
        },
        {
          propertyId: property1.id,
          tenantId: 998,
          status: "pending" as const,
          message: "Looking for immediate move-in"
        },
        {
          propertyId: property2.id,
          tenantId: 997,
          status: "pending" as const,
          message: "Family of four, excellent rental history"
        }
      ];

      for (const app of testApplications) {
        await storage.createApplication(app);
      }

      console.log("[Debug] Created test properties and applications");
    } else {
      console.log("[Debug] Test account already exists, skipping creation");
    }

  } catch (error) {
    console.error("[Debug] Error managing test data:", error);
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
      // Ensure imageUrl is either a string or null before creating property
      const propertyData = {
        ...validation.data,
        landlordId: req.user.id,
        status: "Available" as const,
        available: true,
        pageViews: 0,
        uniqueVisitors: 0,
        submissionCount: 0,
        imageUrl: validation.data.imageUrl || null // Ensure imageUrl is properly handled
      };

      const property = await storage.createProperty(propertyData);
      res.status(201).json(property);
    } catch (error) {
      console.error("Failed to create property:", error);
      res.status(500).json({ message: "Failed to create property" });
    }
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

  // Add this to the registerRoutes function, before return httpServer
  app.patch("/api/applications/bulk", async (req, res) => {
    if (!req.isAuthenticated() || req.user.type !== "landlord") {
      return res.sendStatus(403);
    }

    const { applicationIds, status } = req.body;

    if (!Array.isArray(applicationIds) || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid request format" });
    }

    try {
      await storage.bulkUpdateApplications(applicationIds, status);
      res.sendStatus(200);
    } catch (error) {
      console.error("Failed to update applications:", error);
      res.status(500).json({ message: "Failed to update applications" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}