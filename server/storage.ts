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
        // Handle the response safely
        const keyArray = Array.isArray(keys) ? keys : [];
        for (const key of keyArray) {
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

  // User operations with proper type handling
  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await db.get(`${USERS_PREFIX}${id}`);
      if (result && typeof result === 'object' && 'id' in result) {
        return result as User;
      }
      return undefined;
    } catch (error) {
      console.error('Failed to get user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const keys = await db.list(USERS_PREFIX);
      const keyArray = Array.isArray(keys) ? keys : [];

      for (const key of keyArray) {
        const result = await db.get(key);
        if (
          result && 
          typeof result === 'object' && 
          'username' in result && 
          result.username === username
        ) {
          return result as User;
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

  // Property operations with proper type handling
  async createProperty(insertProperty: Omit<Property, "id" | "createdAt">): Promise<Property> {
    const id = await this.getNextId('properties');
    const property: Property = {
      id,
      ...insertProperty,
      createdAt: new Date(),
      imageUrl: insertProperty.imageUrl || undefined
    };
    await db.set(`${PROPERTIES_PREFIX}${id}`, property);
    return property;
  }

  async getAllProperties(): Promise<Property[]> {
    try {
      const keys = await db.list(PROPERTIES_PREFIX);
      const keyArray = Array.isArray(keys) ? keys : [];

      const properties = await Promise.all(
        keyArray.map(async key => {
          try {
            const result = await db.get(key);
            if (result && typeof result === 'object' && 'id' in result) {
              return result as Property;
            }
            return null;
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
      const result = await db.get(`${PROPERTIES_PREFIX}${id}`);
      if (result && typeof result === 'object' && 'id' in result) {
        return result as Property;
      }
      return undefined;
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

  // Application operations with proper type handling
  async createApplication(insertApplication: Omit<Application, "id" | "createdAt">): Promise<Application> {
    const id = await this.getNextId('applications');
    const application: Application = {
      id,
      ...insertApplication,
      createdAt: new Date(),
      message: insertApplication.message || undefined
    };
    await db.set(`${APPLICATIONS_PREFIX}${id}`, application);
    return application;
  }

  async getTenantApplications(tenantId: number): Promise<Application[]> {
    try {
      const keys = await db.list(APPLICATIONS_PREFIX);
      const keyArray = Array.isArray(keys) ? keys : [];

      const applications = await Promise.all(
        keyArray.map(async key => {
          try {
            const result = await db.get(key);
            if (
              result && 
              typeof result === 'object' && 
              'tenantId' in result && 
              result.tenantId === tenantId
            ) {
              return result as Application;
            }
            return null;
          } catch {
            return null;
          }
        })
      );

      return applications.filter((app): app is Application => app !== null);
    } catch (error) {
      console.error('Failed to get tenant applications:', error);
      return [];
    }
  }

  async getLandlordApplications(landlordId: number): Promise<Application[]> {
    try {
      // First get all properties owned by this landlord
      const propertyKeys = await db.list(PROPERTIES_PREFIX);
      const keyArray = Array.isArray(propertyKeys) ? propertyKeys : [];

      const properties = await Promise.all(
        keyArray.map(async key => {
          try {
            const result = await db.get(key);
            if (
              result && 
              typeof result === 'object' && 
              'landlordId' in result && 
              result.landlordId === landlordId
            ) {
              return result as Property;
            }
            return null;
          } catch {
            return null;
          }
        })
      );

      const landlordPropertyIds = properties
        .filter((prop): prop is Property => prop !== null)
        .map(prop => prop.id);

      // Then get applications for these properties
      const applicationKeys = await db.list(APPLICATIONS_PREFIX);
      const appKeyArray = Array.isArray(applicationKeys) ? applicationKeys : [];

      const applications = await Promise.all(
        appKeyArray.map(async key => {
          try {
            const result = await db.get(key);
            if (
              result && 
              typeof result === 'object' && 
              'propertyId' in result && 
              landlordPropertyIds.includes(result.propertyId)
            ) {
              return result as Application;
            }
            return null;
          } catch {
            return null;
          }
        })
      );

      return applications.filter((app): app is Application => app !== null);
    } catch (error) {
      console.error('Failed to get landlord applications:', error);
      return [];
    }
  }
}

export const storage = new ReplitStorage();