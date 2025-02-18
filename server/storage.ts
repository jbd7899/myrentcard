import type { InsertUser, User, Property, Application } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import Database from "@replit/database";

const MemoryStore = createMemoryStore(session);
const db = new Database();

// Prefix keys to avoid collisions
const USERS_PREFIX = "users:";
const PROPERTIES_PREFIX = "properties:";
const APPLICATIONS_PREFIX = "applications:";

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
  incrementPropertyViews(id: number): Promise<void>;
  incrementPropertySubmissions(id: number): Promise<void>;
  // Application operations
  createApplication(application: Omit<Application, "id" | "createdAt">): Promise<Application>;
  getTenantApplications(tenantId: number): Promise<Application[]>;
  getLandlordApplications(landlordId: number): Promise<Application[]>;
}

export class ReplitStorage implements IStorage {
  sessionStore: session.Store;
  private lastIds: { [key: string]: number };
  private initialized: boolean;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
      stale: true
    });
    this.lastIds = {
      users: 0,
      properties: 0,
      applications: 0
    };
    this.initialized = false;
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      try {
        const keys = await db.list();
        if (Array.isArray(keys)) {
          for (const key of keys) {
            if (key.startsWith(USERS_PREFIX)) {
              const id = parseInt(key.split(':')[1]);
              if (!isNaN(id)) {
                this.lastIds.users = Math.max(this.lastIds.users, id);
              }
            } else if (key.startsWith(PROPERTIES_PREFIX)) {
              const id = parseInt(key.split(':')[1]);
              if (!isNaN(id)) {
                this.lastIds.properties = Math.max(this.lastIds.properties, id);
              }
            } else if (key.startsWith(APPLICATIONS_PREFIX)) {
              const id = parseInt(key.split(':')[1]);
              if (!isNaN(id)) {
                this.lastIds.applications = Math.max(this.lastIds.applications, id);
              }
            }
          }
        }
        this.initialized = true;
      } catch (error) {
        console.error('Failed to initialize storage:', error);
        // Continue with default IDs if initialization fails
        this.initialized = true;
      }
    }
  }

  private async getNextId(type: 'users' | 'properties' | 'applications'): Promise<number> {
    await this.ensureInitialized();
    this.lastIds[type]++;
    return this.lastIds[type];
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const user = await db.get(`${USERS_PREFIX}${id}`);
      return user || undefined;
    } catch (error) {
      console.error('Failed to get user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const keys = await db.list(USERS_PREFIX);
      if (Array.isArray(keys)) {
        for (const key of keys) {
          const user = await db.get(key);
          if (user && user.username === username) {
            return user as User;
          }
        }
      }
      return undefined;
    } catch (error) {
      console.error('Failed to get user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = await this.getNextId('users');
    const user: User = {
      id,
      ...insertUser,
      createdAt: new Date()
    };
    await db.set(`${USERS_PREFIX}${id}`, user);
    return user;
  }

  // Property operations
  async createProperty(insertProperty: Omit<Property, "id" | "createdAt">): Promise<Property> {
    const id = await this.getNextId('properties');
    const property: Property = {
      id,
      ...insertProperty,
      createdAt: new Date()
    };
    await db.set(`${PROPERTIES_PREFIX}${id}`, property);
    return property;
  }

  async getAllProperties(): Promise<Property[]> {
    try {
      const keys = await db.list(PROPERTIES_PREFIX);
      if (!Array.isArray(keys)) return [];

      const properties = await Promise.all(
        keys.map(async key => {
          try {
            return await db.get(key);
          } catch {
            return null;
          }
        })
      );
      return properties.filter((p): p is Property => p !== null);
    } catch (error) {
      console.error('Failed to get all properties:', error);
      return [];
    }
  }

  async getPropertyById(id: number): Promise<Property | undefined> {
    try {
      const property = await db.get(`${PROPERTIES_PREFIX}${id}`);
      return property || undefined;
    } catch (error) {
      console.error('Failed to get property by id:', error);
      return undefined;
    }
  }

  async incrementPropertyViews(id: number): Promise<void> {
    try {
      const property = await this.getPropertyById(id);
      if (property) {
        property.pageViews = (property.pageViews || 0) + 1;
        await db.set(`${PROPERTIES_PREFIX}${id}`, property);
      }
    } catch (error) {
      console.error('Failed to increment property views:', error);
    }
  }

  async incrementPropertySubmissions(id: number): Promise<void> {
    try {
      const property = await this.getPropertyById(id);
      if (property) {
        property.submissionCount = (property.submissionCount || 0) + 1;
        await db.set(`${PROPERTIES_PREFIX}${id}`, property);
      }
    } catch (error) {
      console.error('Failed to increment property submissions:', error);
    }
  }

  // Application operations
  async createApplication(insertApplication: Omit<Application, "id" | "createdAt">): Promise<Application> {
    const id = await this.getNextId('applications');
    const application: Application = {
      id,
      ...insertApplication,
      createdAt: new Date()
    };
    await db.set(`${APPLICATIONS_PREFIX}${id}`, application);
    return application;
  }

  async getTenantApplications(tenantId: number): Promise<Application[]> {
    try {
      const keys = await db.list(APPLICATIONS_PREFIX);
      if (!Array.isArray(keys)) return [];

      const applications = await Promise.all(
        keys.map(async key => {
          try {
            return await db.get(key);
          } catch {
            return null;
          }
        })
      );

      return applications
        .filter((app): app is Application => app !== null && app.tenantId === tenantId);
    } catch (error) {
      console.error('Failed to get tenant applications:', error);
      return [];
    }
  }

  async getLandlordApplications(landlordId: number): Promise<Application[]> {
    try {
      // First get all properties owned by this landlord
      const propertyKeys = await db.list(PROPERTIES_PREFIX);
      if (!Array.isArray(propertyKeys)) return [];

      const properties = await Promise.all(
        propertyKeys.map(async key => {
          try {
            return await db.get(key);
          } catch {
            return null;
          }
        })
      );

      const landlordPropertyIds = properties
        .filter((prop): prop is Property => prop !== null && prop.landlordId === landlordId)
        .map(prop => prop.id);

      // Then get applications for these properties
      const applicationKeys = await db.list(APPLICATIONS_PREFIX);
      if (!Array.isArray(applicationKeys)) return [];

      const applications = await Promise.all(
        applicationKeys.map(async key => {
          try {
            return await db.get(key);
          } catch {
            return null;
          }
        })
      );

      return applications.filter((app): app is Application => 
        app !== null && landlordPropertyIds.includes(app.propertyId)
      );
    } catch (error) {
      console.error('Failed to get landlord applications:', error);
      return [];
    }
  }
}

export const storage = new ReplitStorage();