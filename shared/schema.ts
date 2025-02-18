import { z } from "zod";
import { pgTable, serial, text, timestamp, varchar, boolean, integer, jsonb } from "drizzle-orm/pg-core";
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
  rent: integer('rent').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Application table definition with proper status typing
export const applications = pgTable('applications', {
  id: serial('id').primaryKey(),
  propertyId: integer('property_id').notNull().references(() => properties.id),
  tenantId: integer('tenant_id').notNull().references(() => users.id),
  status: varchar('status', { length: 50 }).$type<'pending' | 'approved' | 'rejected'>().notNull(),
  message: text('message'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Screening Page table definition
export const screeningPages = pgTable('screening_pages', {
  id: serial('id').primaryKey(),
  landlordId: integer('landlord_id').notNull().references(() => users.id),
  propertyId: integer('property_id').references(() => properties.id),
  type: varchar('type', { length: 50 }).notNull().default('property'), // 'general' or 'property'
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  customFields: jsonb('custom_fields').notNull(),
  branding: jsonb('branding').notNull(),
  views: integer('views').default(0).notNull(),
  uniqueVisitors: integer('unique_visitors').default(0).notNull(),
  submissionCount: integer('submission_count').default(0).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Screening Submission table definition
export const screeningSubmissions = pgTable('screening_submissions', {
  id: serial('id').primaryKey(),
  screeningPageId: integer('screening_page_id').notNull().references(() => screeningPages.id),
  tenantId: integer('tenant_id').references(() => users.id),
  formData: jsonb('form_data').notNull(),
  status: varchar('status', { length: 50 }).$type<'pending' | 'approved' | 'rejected'>().notNull(),
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
  submissionCount: true,
  rent: true
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true
}).extend({
  status: z.enum(["pending", "approved", "rejected"])
});

// Screening page schemas
export const brandingSchema = z.object({
  logo: z.string().optional(),
  primaryColor: z.string(),
  accentColor: z.string().optional(),
  fontFamily: z.string().optional(),
  customCss: z.string().optional()
});

export const customFieldSchema = z.object({
  id: z.string(),
  type: z.enum(["text", "number", "date", "select", "checkbox", "file"]),
  label: z.string(),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    message: z.string().optional()
  }).optional()
});

export const insertScreeningPageSchema = createInsertSchema(screeningPages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  views: true,
  uniqueVisitors: true,
  submissionCount: true
}).extend({
  type: z.enum(["general", "property"]),
  customFields: z.array(customFieldSchema),
  branding: brandingSchema
});

export const insertScreeningSubmissionSchema = createInsertSchema(screeningSubmissions).omit({
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
export type ScreeningPage = typeof screeningPages.$inferSelect;
export type ScreeningSubmission = typeof screeningSubmissions.$inferSelect;
export type CustomField = z.infer<typeof customFieldSchema>;
export type Branding = z.infer<typeof brandingSchema>;

// Property requirements schema (for validation)
export const propertyRequirementsSchema = z.object({
  noEvictions: z.boolean().optional(),
  cleanRentalHistory: z.boolean().optional(),
});

export type PropertyRequirements = z.infer<typeof propertyRequirementsSchema>;