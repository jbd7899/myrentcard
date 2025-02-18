import { z } from "zod";

// User schema
const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  password: z.string(),
  type: z.enum(["tenant", "landlord"]),
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  createdAt: z.date()
});

// Property schema
const propertySchema = z.object({
  id: z.number(),
  landlordId: z.number(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string().optional(),
  address: z.string(),
  units: z.number(),
  parkingSpaces: z.number(),
  status: z.enum(["Available", "Rented", "Pending"]).default("Available"),
  available: z.boolean().default(true),
  pageViews: z.number().default(0),
  uniqueVisitors: z.number().default(0),
  submissionCount: z.number().default(0),
  createdAt: z.date()
});

// Application schema
const applicationSchema = z.object({
  id: z.number(),
  propertyId: z.number(),
  tenantId: z.number(),
  status: z.enum(["pending", "approved", "rejected"]),
  message: z.string().optional(),
  createdAt: z.date()
});

// Create insert schemas (omitting auto-generated fields)
export const insertUserSchema = userSchema.omit({ 
  id: true,
  createdAt: true 
});

export const insertPropertySchema = propertySchema.omit({ 
  id: true,
  createdAt: true,
  pageViews: true,
  uniqueVisitors: true,
  submissionCount: true
});

export const insertApplicationSchema = applicationSchema.omit({ 
  id: true,
  createdAt: true 
});

// Export types
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Property = z.infer<typeof propertySchema>;
export type Application = z.infer<typeof applicationSchema>;

// Property requirements schema
export const propertyRequirementsSchema = z.object({
  noEvictions: z.boolean().optional(),
  cleanRentalHistory: z.boolean().optional(),
});

export type PropertyRequirements = z.infer<typeof propertyRequirementsSchema>;