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
  setupAuth(app);

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
    if (!req.isAuthenticated()) {
      return res.sendStatus(403);
    }
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
      status: "Available",
      pageViews: 0,
      uniqueVisitors: 0,
      submissionCount: 0
    });
    res.status(201).json(property);
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
      return res.sendStatus(403);
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