import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  type: text("type", { enum: ["tenant", "landlord"] }).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  landlordId: integer("landlord_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  rent: integer("rent").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  requirements: jsonb("requirements").notNull(),
  status: text("status", { enum: ["Available", "Rented", "Pending"] }).notNull().default("Available"),
  available: boolean("available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  tenantId: integer("tenant_id").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull(),
  creditScore: integer("credit_score"),
  income: integer("income"),
  moveInDate: timestamp("move_in_date"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Property = typeof properties.$inferSelect;
export type Application = typeof applications.$inferSelect;

// Property requirements schema
export const propertyRequirementsSchema = z.object({
  minCreditScore: z.number().min(300).max(850).optional(),
  minIncome: z.number().min(0).optional(),
  noEvictions: z.boolean().optional(),
  cleanRentalHistory: z.boolean().optional(),
});

export type PropertyRequirements = z.infer<typeof propertyRequirementsSchema>;