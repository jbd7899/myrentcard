import { z } from "zod";
import { pgTable, serial, text, timestamp, varchar, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// User table definition
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),  // Can be "tenant", "landlord", or "both"
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Property table definition
export const properties = pgTable('properties', {
  id: serial('id').primaryKey(),
  landlordId: integer('landlord_id').notNull().references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  imageUrl: varchar('image_url', { length: 255 }),
  address: varchar('address', { length: 255 }).notNull(),
  units: integer('units').notNull(),
  parkingSpaces: integer('parking_spaces').notNull(),
  status: varchar('status', { length: 50 }).default('Available').notNull(),
  available: boolean('available').default(true).notNull(),
  pageViews: integer('page_views').default(0).notNull(),
  uniqueVisitors: integer('unique_visitors').default(0).notNull(),
  submissionCount: integer('submission_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Application table definition with proper status typing
export const applications = pgTable('applications', {
  id: serial('id').primaryKey(),
  propertyId: integer('property_id').notNull().references(() => properties.id),
  tenantId: integer('tenant_id').notNull().references(() => users.id),
  status: varchar('status', { length: 50 }).notNull(),
  message: text('message'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Create Zod schemas from the table definitions
export const insertUserSchema = createInsertSchema(users, {
  type: z.enum(["tenant", "landlord", "both"]),
}).omit({ id: true, createdAt: true });

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  pageViews: true,
  uniqueVisitors: true,
  submissionCount: true
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true
}).extend({
  status: z.enum(["pending", "approved", "rejected"])
});

// Export inferred types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Property = typeof properties.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type ApplicationStatus = "pending" | "approved" | "rejected";

// Property requirements schema (for validation)
export const propertyRequirementsSchema = z.object({
  noEvictions: z.boolean().optional(),
  cleanRentalHistory: z.boolean().optional(),
});

export type PropertyRequirements = z.infer<typeof propertyRequirementsSchema>;