import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import express from 'express';
import fs from 'fs';
import { insertPropertySchema, insertApplicationSchema, insertScreeningPageSchema, insertScreeningSubmissionSchema, insertRentCardSchema, insertRentalReferenceSchema } from "@shared/schema";
import crypto from 'crypto';

// Helper function for generating random URL IDs
function generateUrlId(): string {
  const length = 32;
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function registerRoutes(app: Express): Promise<Server> {
  try {
    console.log("[Debug] Initializing routes and test data...");

    // Check if test account already exists
    const existingTestUser = await storage.getUserByUsername("landlordtest");
    if (!existingTestUser) {
      console.log("[Debug] No test account found, creating test accounts...");


  // Health check endpoint
  app.get("/", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });


      // Create test landlord account
      const testLandlord = await storage.createUser({
        username: "landlordtest",
        password: "test1",
        type: "both",  // Allow both roles
        name: "Landlord Test", 
        email: "landlordtest@example.com",
        phone: "1234567890"
      });
      console.log("[Debug] Created test landlord:", testLandlord);

      // Create test tenant
      const testTenant = await storage.createUser({
        username: "testtenant1",
        password: "test1",
        type: "tenant",
        name: "Test Tenant 1",
        email: "tenant1@example.com",
        phone: "9876543210"
      });
      console.log("[Debug] Created test tenant:", testTenant);

      // Create test properties
      const property1 = await storage.createProperty({
        landlordId: testLandlord.id,
        title: "Luxury Downtown Apartment",
        description: "Modern 2-bedroom apartment in the heart of downtown",
        address: "123 Main St",
        units: 4,
        parkingSpaces: 2,
        status: "Available",
        available: true,
        pageViews: 0,
        uniqueVisitors: 0,
        submissionCount: 0,
        rent: 2500,
        imageUrl: null
      });
      console.log("[Debug] Created test property 1:", property1);

      const property2 = await storage.createProperty({
        landlordId: testLandlord.id,
        title: "Suburban Family Home",
        description: "Spacious 3-bedroom house with garden",
        address: "456 Oak Ave",
        units: 1,
        parkingSpaces: 2,
        status: "Available",
        available: true,
        pageViews: 0,
        uniqueVisitors: 0,
        submissionCount: 0,
        rent: 3000,
        imageUrl: null
      });
      console.log("[Debug] Created test property 2:", property2);

      // Create test screening pages with random URLs
      const generalScreeningPage = await storage.createScreeningPage({
        landlordId: testLandlord.id,
        propertyId: null,
        type: "general",
        urlId: generateUrlId(), // Generate random URL ID
        title: "Landlord Test General Rental Application",
        description: "Apply for any of our available properties",
        customFields: [
          {
            id: "income",
            type: "number",
            label: "Monthly Income",
            required: true,
            validation: {
              min: 0,
              message: "Please enter a valid income amount"
            }
          },
          {
            id: "employment",
            type: "text",
            label: "Current Employer",
            required: true
          }
        ],
        branding: {
          logo: null,
          primaryColor: "#4361ee",
          accentColor: "#3a0ca3",
          fontFamily: "Inter",
          customCss: ""
        },
        active: true
      });
      console.log("[Debug] Created general screening page:", generalScreeningPage);

      const propertyScreeningPage = await storage.createScreeningPage({
        landlordId: testLandlord.id,
        propertyId: property1.id,
        type: "property",
        urlId: generateUrlId(), // Generate random URL ID
        title: `${property1.title} - Rental Application`,
        description: `Apply for ${property1.title} at ${property1.address}`,
        customFields: [
          {
            id: "moveInDate",
            type: "date",
            label: "Desired Move-in Date",
            required: true
          },
          {
            id: "occupants",
            type: "number",
            label: "Number of Occupants",
            required: true,
            validation: {
              min: 1,
              max: 10,
              message: "Please enter a number between 1 and 10"
            }
          }
        ],
        branding: {
          logo: null,
          primaryColor: "#4361ee",
          accentColor: "#3a0ca3",
          fontFamily: "Inter",
          customCss: ""
        },
        active: true
      });
      console.log("[Debug] Created property screening page:", propertyScreeningPage);

      // Create test applications
      const testApplications = [
        {
          propertyId: property1.id,
          tenantId: testTenant.id,
          status: 'pending' as const,
          message: "Interested in moving in next month"
        },
        {
          propertyId: property2.id,
          tenantId: testTenant.id,
          status: 'pending' as const,
          message: "Looking for immediate move-in"
        }
      ];

      for (const app of testApplications) {
        const createdApp = await storage.createApplication(app);
        console.log("[Debug] Created test application:", createdApp);
      }

      console.log("[Debug] Completed creating test data");
    } else {
      console.log("[Debug] Test account already exists, skipping creation");
    }

  } catch (error) {
    console.error("[Debug] Error managing test data:", error);
    throw error;
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
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    if (req.user.type !== "landlord" && req.user.type !== "both") {
      return res.status(403).json({ message: "Only landlords can create properties" });
    }

    const validation = insertPropertySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validation.error);
    }

    try {
      const propertyData = {
        ...validation.data,
        landlordId: req.user.id,
        status: "Available",
        available: true,
        pageViews: 0,
        uniqueVisitors: 0,
        submissionCount: 0
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
    if (!propertyId) {
      return res.status(400).json({ message: "Invalid property ID" });
    }

    await storage.incrementPropertyViews(propertyId);
    res.sendStatus(200);
  });

  // Application routes
  app.get("/api/applications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    let applications;
    if (req.user.type === "tenant" || req.user.type === "both") {
      applications = await storage.getTenantApplications(req.user.id);
    } else if (req.user.type === "landlord") {
      applications = await storage.getLandlordApplications(req.user.id);
    } else {
      return res.sendStatus(403);
    }

    res.json(applications);
  });

  app.post("/api/applications", async (req, res) => {
    if (!req.isAuthenticated() || req.user.type !== "tenant" && req.user.type !== "both") {
      return res.sendStatus(403);
    }

    const validation = insertApplicationSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validation.error);
    }

    try {
      const application = await storage.createApplication({
        ...validation.data,
        tenantId: req.user.id,
        status: "pending",
        message: validation.data.message || null
      });

      // Increment submission count for the property
      await storage.incrementPropertySubmissions(validation.data.propertyId);

      res.status(201).json(application);
    } catch (error) {
      console.error("Failed to create application:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.patch("/api/applications/bulk", async (req, res) => {
    if (!req.isAuthenticated() || req.user.type !== "landlord" && req.user.type !== "both") {
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

  // Screening page routes
  app.get("/api/screening-pages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const pages = await storage.getScreeningPages(req.user.id);
      res.json(pages);
    } catch (error) {
      console.error("Failed to fetch screening pages:", error);
      res.status(500).json({ message: "Failed to fetch screening pages" });
    }
  });

  app.post("/api/screening-pages", async (req, res) => {
    if (!req.isAuthenticated() || (req.user.type !== "landlord" && req.user.type !== "both")) {
      return res.sendStatus(403);
    }

    const validation = insertScreeningPageSchema.safeParse({
      ...req.body,
      urlId: generateUrlId(), // Generate random URL ID
    });

    if (!validation.success) {
      return res.status(400).json(validation.error);
    }

    try {
      const screeningPage = await storage.createScreeningPage({
        ...validation.data,
        landlordId: req.user.id
      });
      res.status(201).json(screeningPage);
    } catch (error) {
      console.error("Failed to create screening page:", error);
      res.status(500).json({ message: "Failed to create screening page" });
    }
  });

  // Add route for accessing screening pages by URL ID
  app.get("/api/screening/:urlId", async (req, res) => {
    try {
      const page = await storage.getScreeningPageByUrlId(req.params.urlId);
      if (!page) {
        return res.status(404).json({ message: "Screening page not found" });
      }

      // Increment the view counter when the page is accessed
      await storage.incrementScreeningPageViews(page.id);

      res.json(page);
    } catch (error) {
      console.error("Failed to fetch screening page:", error);
      res.status(500).json({ message: "Failed to fetch screening page" });
    }
  });

  app.get("/api/screening-pages/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Invalid screening page ID" });
    }

    try {
      const page = await storage.getScreeningPageById(id);
      if (!page) {
        return res.status(404).json({ message: "Screening page not found" });
      }
      res.json(page);
    } catch (error) {
      console.error("Failed to fetch screening page:", error);
      res.status(500).json({ message: "Failed to fetch screening page" });
    }
  });

  app.patch("/api/screening-pages/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user.type !== "landlord" && req.user.type !== "both")) {
      return res.sendStatus(403);
    }

    const id = parseInt(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Invalid screening page ID" });
    }

    const validation = insertScreeningPageSchema.partial().safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validation.error);
    }

    try {
      const page = await storage.getScreeningPageById(id);
      if (!page || page.landlordId !== req.user.id) {
        return res.status(404).json({ message: "Screening page not found" });
      }

      const updated = await storage.updateScreeningPage(id, validation.data);
      res.json(updated);
    } catch (error) {
      console.error("Failed to update screening page:", error);
      res.status(500).json({ message: "Failed to update screening page" });
    }
  });

  app.post("/api/screening-pages/:id/view", async (req, res) => {
    const id = parseInt(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Invalid screening page ID" });
    }

    try {
      await storage.incrementScreeningPageViews(id);
      res.sendStatus(200);
    } catch (error) {
      console.error("Failed to track page view:", error);
      res.status(500).json({ message: "Failed to track page view" });
    }
  });

  // Screening submission routes
  app.post("/api/screening-pages/:id/submit", async (req, res) => {
    const id = parseInt(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Invalid screening page ID" });
    }

    const validation = insertScreeningSubmissionSchema.safeParse({
      ...req.body,
      screeningPageId: id,
      status: "pending",
      tenantId: req.isAuthenticated() ? req.user.id : null
    });

    if (!validation.success) {
      return res.status(400).json(validation.error);
    }

    try {
      const submission = await storage.createScreeningSubmission(validation.data);
      res.status(201).json(submission);
    } catch (error) {
      console.error("Failed to create submission:", error);
      res.status(500).json({ message: "Failed to create submission" });
    }
  });

  app.get("/api/screening-pages/:id/submissions", async (req, res) => {
    if (!req.isAuthenticated() || (req.user.type !== "landlord" && req.user.type !== "both")) {
      return res.sendStatus(403);
    }

    const id = parseInt(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Invalid screening page ID" });
    }

    try {
      const page = await storage.getScreeningPageById(id);
      if (!page || page.landlordId !== req.user.id) {
        return res.status(404).json({ message: "Screening page not found" });
      }

      const submissions = await storage.getScreeningSubmissions(id);
      res.json(submissions);
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.patch("/api/screening-submissions/:id/status", async (req, res) => {
    if (!req.isAuthenticated() || (req.user.type !== "landlord" && req.user.type !== "both")) {
      return res.sendStatus(403);
    }

    const id = parseInt(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Invalid submission ID" });
    }

    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    try {
      await storage.updateScreeningSubmissionStatus(id, status);
      res.sendStatus(200);
    } catch (error) {
      console.error("Failed to update submission status:", error);
      res.status(500).json({ message: "Failed to update submission status" });
    }
  });

  // RentCard routes
  app.get("/api/rentcards", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const rentCards = await storage.getRentCards(req.user.id);
      res.json(rentCards);
    } catch (error) {
      console.error("Failed to fetch RentCards:", error);
      res.status(500).json({ message: "Failed to fetch RentCards" });
    }
  });

  app.post("/api/rentcards", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const validation = insertRentCardSchema.safeParse({
      ...req.body,
      tenantId: req.user.id,
      urlId: generateUrlId(), // Generate random URL ID for the RentCard
      views: 0
    });

    if (!validation.success) {
      return res.status(400).json(validation.error);
    }

    try {
      const rentCard = await storage.createRentCard(validation.data);
      res.status(201).json(rentCard);
    } catch (error) {
      console.error("Failed to create RentCard:", error);
      res.status(500).json({ message: "Failed to create RentCard" });
    }
  });

  // Reference routes
  app.get("/api/references", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const references = await storage.getRentalReferences(req.user.id);
      res.json(references);
    } catch (error) {
      console.error("Failed to fetch references:", error);
      res.status(500).json({ message: "Failed to fetch references" });
    }
  });

  app.post("/api/references/request", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    try {
      // Create a pending reference request
      const reference = await storage.createRentalReference({
        tenantId: req.user.id,
        landlordEmail: email,
        status: "pending",
        // Other fields will be filled when landlord responds
        landlordName: null,
        propertyAddress: null,
        comment: null
      });

      // In a real app, we would send an email to the landlord here
      // For now, we'll just return success
      res.status(201).json(reference);
    } catch (error) {
      console.error("Failed to create reference request:", error);
      res.status(500).json({ message: "Failed to create reference request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}