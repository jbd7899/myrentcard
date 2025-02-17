import { users, properties, applications } from "@shared/schema";
import type { InsertUser, User, Property, Application } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { sql } from 'drizzle-orm';

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Property operations
  createProperty(property: Omit<Property, "id" | "createdAt">): Promise<Property>;
  getAllProperties(): Promise<Property[]>;
  getPropertyById(id: number): Promise<Property | undefined>;

  // Application operations
  createApplication(application: Omit<Application, "id" | "createdAt">): Promise<Application>;
  getTenantApplications(tenantId: number): Promise<Application[]>;
  getLandlordApplications(landlordId: number): Promise<Application[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
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

  async createProperty(insertProperty: Omit<Property, "id" | "createdAt">): Promise<Property> {
    const [property] = await db.insert(properties).values(insertProperty).returning();
    return property;
  }

  async getAllProperties(): Promise<Property[]> {
    return db.select().from(properties);
  }

  async getPropertyById(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async createApplication(insertApplication: Omit<Application, "id" | "createdAt">): Promise<Application> {
    const [application] = await db.insert(applications).values(insertApplication).returning();
    return application;
  }

  async getTenantApplications(tenantId: number): Promise<Application[]> {
    return db.select().from(applications).where(eq(applications.tenantId, tenantId));
  }

  async getLandlordApplications(landlordId: number): Promise<Application[]> {
    const landlordProperties = await db
      .select()
      .from(properties)
      .where(eq(properties.landlordId, landlordId));

    const propertyIds = landlordProperties.map(prop => prop.id);

    return db
      .select()
      .from(applications)
      .where(sql`${applications.propertyId} = ANY(${propertyIds})`);
  }
}

export const storage = new DatabaseStorage();