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

export async function registerRoutes(app: Express): Promise<Server> {
  try {
    console.log("[Debug] Initializing routes...");

    setupAuth(app);

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

    // API Routes
    const apiRouter = express.Router();

    // Health check endpoint that doesn't interfere with frontend routing
    apiRouter.get("/health", (req, res) => {
      res.status(200).json({ status: "ok" });
    });

    // Image upload route
    apiRouter.post("/upload", upload.single('image'), (req, res) => {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ url: imageUrl });
    });

    // Property routes
    apiRouter.get("/properties", async (req, res) => {
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

    apiRouter.post("/properties", async (req, res) => {
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

    apiRouter.post("/properties/:id/view", async (req, res) => {
        const propertyId = parseInt(req.params.id);
        if (!propertyId) {
          return res.status(400).json({ message: "Invalid property ID" });
        }

        await storage.incrementPropertyViews(propertyId);
        res.sendStatus(200);
      });


    // Application routes
    apiRouter.get("/applications", async (req, res) => {
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

    apiRouter.post("/applications", async (req, res) => {
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

    apiRouter.patch("/applications/bulk", async (req, res) => {
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
    apiRouter.get("/screening-pages", async (req, res) => {
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

    apiRouter.post("/screening-pages", async (req, res) => {
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

    apiRouter.get("/screening/:urlId", async (req, res) => {
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

    apiRouter.get("/screening-pages/:id", async (req, res) => {
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

    apiRouter.patch("/screening-pages/:id", async (req, res) => {
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

    apiRouter.post("/screening-pages/:id/view", async (req, res) => {
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
    apiRouter.post("/screening-pages/:id/submit", async (req, res) => {
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

    apiRouter.get("/screening-pages/:id/submissions", async (req, res) => {
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

    apiRouter.patch("/screening-submissions/:id/status", async (req, res) => {
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
    apiRouter.get("/rentcards", async (req, res) => {
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

    apiRouter.post("/rentcards", async (req, res) => {
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
    apiRouter.get("/references", async (req, res) => {
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

    apiRouter.post("/references/request", async (req, res) => {
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

    // Serve uploaded files
    app.use('/uploads', express.static('uploads'));

    // Mount all API routes under /api prefix
    app.use('/api', apiRouter);

    const httpServer = createServer(app);
    return httpServer;
  } catch (error) {
    console.error(`Error registering routes: ${error}`);
    throw error;
  }
}