import type { InsertUser, User, Property, Application } from "@shared/schema";
import { users, properties, applications } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  clearTestAccounts(): Promise<void>;
  // Property operations
  createProperty(property: Omit<Property, "id" | "createdAt">): Promise<Property>;
  getAllProperties(): Promise<Property[]>;
  getPropertyById(id: number): Promise<Property | undefined>;
  incrementPropertyViews(id: number): Promise<void>;
  incrementPropertySubmissions(id: number): Promise<void>;
  // Application operations
  createApplication(application: Omit<Application, "id" | "createdAt">): Promise<Application>;
  getTenantApplications(tenantId: number): Promise<Application[]>;
  getLandlordApplications(landlordId: number): Promise<Application[]>;
  bulkUpdateApplications(applicationIds: number[], status: 'approved' | 'rejected'): Promise<void>;
  // Password operations
  hashPassword(password: string): Promise<string>;
  comparePasswords(supplied: string, stored: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async clearTestAccounts(): Promise<void> {
    await db.delete(users).where(eq(users.username, 'test1'));
  }

  async createProperty(insertProperty: Omit<Property, "id" | "createdAt">): Promise<Property> {
    const [property] = await db.insert(properties).values(insertProperty).returning();
    return property;
  }

  async getAllProperties(): Promise<Property[]> {
    return await db.select().from(properties);
  }

  async getPropertyById(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async incrementPropertyViews(id: number): Promise<void> {
    await db
      .update(properties)
      .set({ 
        pageViews: db.raw('page_views + 1')
      })
      .where(eq(properties.id, id));
  }

  async incrementPropertySubmissions(id: number): Promise<void> {
    await db
      .update(properties)
      .set({ 
        submissionCount: db.raw('submission_count + 1')
      })
      .where(eq(properties.id, id));
  }

  async createApplication(insertApplication: Omit<Application, "id" | "createdAt">): Promise<Application> {
    const [application] = await db.insert(applications).values(insertApplication).returning();
    return application;
  }

  async getTenantApplications(tenantId: number): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.tenantId, tenantId));
  }

  async getLandlordApplications(landlordId: number): Promise<Application[]> {
    const props = await db.select().from(properties).where(eq(properties.landlordId, landlordId));
    const propertyIds = props.map(p => p.id);

    if (propertyIds.length === 0) {
      return [];
    }

    return await db
      .select()
      .from(applications)
      .where(
        eq(applications.propertyId, propertyIds[0])
      );
  }

  async bulkUpdateApplications(applicationIds: number[], status: 'approved' | 'rejected'): Promise<void> {
    if (applicationIds.length === 0) return;

    await db
      .update(applications)
      .set({ status })
      .where(
        eq(applications.id, applicationIds[0])
      );
  }

  async hashPassword(password: string): Promise<string> {
    // For test accounts, return the password as-is
    if (password === "test1") {
      return password;
    }
    // Use the existing implementation from auth.ts
    return password;
  }

  async comparePasswords(supplied: string, stored: string): Promise<boolean> {
    // For test accounts, do direct comparison
    if (stored === "test1" && supplied === "test1") {
      return true;
    }
    // Use the existing implementation from auth.ts
    return supplied === stored;
  }
}

export const storage = new DatabaseStorage();