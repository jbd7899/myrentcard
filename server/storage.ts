import type { InsertUser, User, Property, Application } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import Database from "@replit/database";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);
const MemoryStore = createMemoryStore(session);
const db = new Database();

// Prefix keys to avoid collisions
const USERS_PREFIX = "users:";
const PROPERTIES_PREFIX = "properties:";
const APPLICATIONS_PREFIX = "applications:";

// Helper function to validate User object
function isValidUser(obj: any): obj is User {
  return (
    obj &&
    typeof obj === 'object' &&
    'id' in obj &&
    'username' in obj &&
    'password' in obj &&
    'type' in obj &&
    'name' in obj &&
    'email' in obj
  );
}

// Helper function to validate Property object
function isValidProperty(obj: any): obj is Property {
  return obj && typeof obj === 'object' && 'id' in obj;
}

// Helper function to validate Application object
function isValidApplication(obj: any): obj is Application {
  return obj && typeof obj === 'object' && 'id' in obj;
}


export interface IStorage {
  sessionStore: session.Store;
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  clearTestAccounts(): Promise<void>; // Added function
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
  // Add new method for bulk application updates
  bulkUpdateApplications(applicationIds: number[], status: 'approved' | 'rejected'): Promise<void>;
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
        console.log("[Storage Debug] Initializing storage...");
        const keys = await db.list();
        const keyArray = Array.isArray(keys) ? keys : [];
        for (const key of keyArray) {
          console.log("[Storage Debug] Processing key:", key);
          if (key.startsWith(USERS_PREFIX)) {
            const id = parseInt(key.split(':')[1]);
            if (!isNaN(id)) {
              this.lastIds.users = Math.max(this.lastIds.users, id);
              console.log("[Storage Debug] Updated users lastId:", this.lastIds.users);
            }
          } else if (key.startsWith(PROPERTIES_PREFIX)) {
            const id = parseInt(key.split(':')[1]);
            if (!isNaN(id)) {
              this.lastIds.properties = Math.max(this.lastIds.properties, id);
              console.log("[Storage Debug] Updated properties lastId:", this.lastIds.properties);
            }
          } else if (key.startsWith(APPLICATIONS_PREFIX)) {
            const id = parseInt(key.split(':')[1]);
            if (!isNaN(id)) {
              this.lastIds.applications = Math.max(this.lastIds.applications, id);
              console.log("[Storage Debug] Updated applications lastId:", this.lastIds.applications);
            }
          }
        }
        this.initialized = true;
        console.log("[Storage Debug] Storage initialized with lastIds:", this.lastIds);
      } catch (error) {
        console.error('[Storage Debug] Failed to initialize storage:', error);
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
      console.log("[Storage Debug] Getting user with id:", id);
      const key = `${USERS_PREFIX}${id}`;
      const result = await db.get(key);
      console.log("[Storage Debug] Raw user data:", result);

      if (isValidUser(result)) {
        console.log("[Storage Debug] Valid user found:", result.username);
        return result;
      }

      console.log("[Storage Debug] Invalid or missing user data");
      return undefined;
    } catch (error) {
      console.error('[Storage Debug] Failed to get user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      console.log("[Storage Debug] Getting user by username:", username);
      const keys = await db.list(USERS_PREFIX);
      const keyArray = Array.isArray(keys) ? keys : [];
      console.log("[Storage Debug] Found user keys:", keyArray);

      for (const key of keyArray) {
        const result = await db.get(key);
        console.log("[Storage Debug] Checking user data:", result);

        if (
          result &&
          typeof result === 'object' &&
          'username' in result &&
          result.username === username
        ) {
          console.log("[Storage Debug] Found matching user:", username);
          return result as User;
        }
      }
      console.log("[Storage Debug] No user found with username:", username);
      return undefined;
    } catch (error) {
      console.error('[Storage Debug] Failed to get user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      console.log("[Storage Debug] Creating new user:", insertUser.username);
      const id = await this.getNextId('users');
      const user: User = {
        id,
        ...insertUser,
        createdAt: new Date()
      };
      const key = `${USERS_PREFIX}${id}`;
      await db.set(key, user);
      console.log("[Storage Debug] Successfully created user:", user);
      return user;
    } catch (error) {
      console.error('[Storage Debug] Failed to create user:', error);
      throw error;
    }
  }

  async clearTestAccounts(): Promise<void> {
    try {
      console.log("[Storage Debug] Clearing test accounts...");
      const keys = await db.list(USERS_PREFIX);
      const keyArray = Array.isArray(keys) ? keys : [];

      for (const key of keyArray) {
        const user = await db.get(key);
        if (user &&
            typeof user === 'object' &&
            'username' in user &&
            (user.username === 'testlandlord' || user.username === 'testtenant' || user.username === 'test1')) {
          //Check if the account exists before deleting.
          const exists = await db.get(key)
          if (exists) {
            console.log("[Storage Debug] Deleting test account:", user.username);
            await db.delete(key);
          }
        }
      }
      console.log("[Storage Debug] Test accounts cleared.");
    } catch (error) {
      console.error('Failed to clear test accounts:', error);
    }
  }


  // Property operations with proper type handling
  async createProperty(insertProperty: Omit<Property, "id" | "createdAt">): Promise<Property> {
    try {
      console.log("[Storage Debug] Creating new property:", insertProperty.address);
      const id = await this.getNextId('properties');
      const property: Property = {
        id,
        ...insertProperty,
        createdAt: new Date(),
        imageUrl: insertProperty.imageUrl || undefined,
        pageViews: 0,
        submissionCount: 0
      };
      await db.set(`${PROPERTIES_PREFIX}${id}`, property);
      console.log("[Storage Debug] Successfully created property:", property);
      return property;
    } catch (error) {
      console.error('[Storage Debug] Failed to create property:', error);
      throw error;
    }
  }

  async getAllProperties(): Promise<Property[]> {
    try {
      console.log("[Storage Debug] Getting all properties...");
      const keys = await db.list(PROPERTIES_PREFIX);
      const keyArray = Array.isArray(keys) ? keys : [];

      const properties = await Promise.all(
        keyArray.map(async key => {
          try {
            const result = await db.get(key);
            console.log("[Storage Debug] Checking property data:", result);
            if (isValidProperty(result)) {
              return result;
            }
            return null;
          } catch (error) {
            console.error("[Storage Debug] Error getting property:", error);
            return null;
          }
        })
      );

      const validProperties = properties.filter((p): p is Property => p !== null);
      console.log("[Storage Debug] Retrieved properties:", validProperties);
      return validProperties;
    } catch (error) {
      console.error('Failed to get all properties:', error);
      return [];
    }
  }

  async getPropertyById(id: number): Promise<Property | undefined> {
    try {
      console.log("[Storage Debug] Getting property with id:", id);
      const key = `${PROPERTIES_PREFIX}${id}`;
      const result = await db.get(key);
      console.log("[Storage Debug] Raw property data:", result);
      if (isValidProperty(result)) {
        console.log("[Storage Debug] Valid property found:", result);
        return result;
      }
      console.log("[Storage Debug] Invalid or missing property data");
      return undefined;
    } catch (error) {
      console.error('[Storage Debug] Failed to get property by id:', error);
      return undefined;
    }
  }

  async incrementPropertyViews(id: number): Promise<void> {
    try {
      console.log("[Storage Debug] Incrementing views for property id:", id);
      const property = await this.getPropertyById(id);
      if (property) {
        property.pageViews = (property.pageViews || 0) + 1;
        await db.set(`${PROPERTIES_PREFIX}${id}`, property);
        console.log("[Storage Debug] Property views incremented:", property.pageViews);
      }
    } catch (error) {
      console.error('Failed to increment property views:', error);
    }
  }

  async incrementPropertySubmissions(id: number): Promise<void> {
    try {
      console.log("[Storage Debug] Incrementing submissions for property id:", id);
      const property = await this.getPropertyById(id);
      if (property) {
        property.submissionCount = (property.submissionCount || 0) + 1;
        await db.set(`${PROPERTIES_PREFIX}${id}`, property);
        console.log("[Storage Debug] Property submissions incremented:", property.submissionCount);
      }
    } catch (error) {
      console.error('Failed to increment property submissions:', error);
    }
  }

  // Application operations with proper type handling
  async createApplication(insertApplication: Omit<Application, "id" | "createdAt">): Promise<Application> {
    try {
      console.log("[Storage Debug] Creating new application:", insertApplication);
      const id = await this.getNextId('applications');
      const application: Application = {
        id,
        ...insertApplication,
        createdAt: new Date(),
        message: insertApplication.message || undefined,
        status: 'pending'
      };
      await db.set(`${APPLICATIONS_PREFIX}${id}`, application);
      console.log("[Storage Debug] Successfully created application:", application);
      return application;
    } catch (error) {
      console.error('[Storage Debug] Failed to create application:', error);
      throw error;
    }
  }

  async getTenantApplications(tenantId: number): Promise<Application[]> {
    try {
      console.log("[Storage Debug] Getting applications for tenant id:", tenantId);
      const keys = await db.list(APPLICATIONS_PREFIX);
      const keyArray = Array.isArray(keys) ? keys : [];

      const applications = await Promise.all(
        keyArray.map(async key => {
          try {
            const result = await db.get(key);
            console.log("[Storage Debug] Checking application data:", result);
            if (isValidApplication(result) && result.tenantId === tenantId) {
              return result;
            }
            return null;
          } catch (error) {
            console.error("[Storage Debug] Error getting application:", error);
            return null;
          }
        })
      );

      const validApplications = applications.filter((app): app is Application => app !== null);
      console.log("[Storage Debug] Retrieved applications:", validApplications);
      return validApplications;
    } catch (error) {
      console.error('Failed to get tenant applications:', error);
      return [];
    }
  }

  async getLandlordApplications(landlordId: number): Promise<Application[]> {
    try {
      console.log("[Storage Debug] Getting applications for landlord id:", landlordId);
      // First get all properties owned by this landlord
      const propertyKeys = await db.list(PROPERTIES_PREFIX);
      const keyArray = Array.isArray(propertyKeys) ? propertyKeys : [];

      const properties = await Promise.all(
        keyArray.map(async key => {
          try {
            const result = await db.get(key);
            console.log("[Storage Debug] Checking property data:", result);
            if (isValidProperty(result) && result.landlordId === landlordId) {
              return result;
            }
            return null;
          } catch (error) {
            console.error("[Storage Debug] Error getting property:", error);
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
            console.log("[Storage Debug] Checking application data:", result);
            if (isValidApplication(result) && landlordPropertyIds.includes(result.propertyId)) {
              return result;
            }
            return null;
          } catch (error) {
            console.error("[Storage Debug] Error getting application:", error);
            return null;
          }
        })
      );

      const validApplications = applications.filter((app): app is Application => app !== null);
      console.log("[Storage Debug] Retrieved applications:", validApplications);
      return validApplications;
    } catch (error) {
      console.error('Failed to get landlord applications:', error);
      return [];
    }
  }

  async bulkUpdateApplications(applicationIds: number[], status: 'approved' | 'rejected'): Promise<void> {
    try {
      console.log("[Storage Debug] Bulk updating applications:", applicationIds, "to status:", status);
      for (const id of applicationIds) {
        const key = `${APPLICATIONS_PREFIX}${id}`;
        const application = await db.get(key);
        if (isValidApplication(application)) {
          await db.set(key, {
            ...application,
            status
          });
          console.log("[Storage Debug] Updated application:", application.id, "status:", status);
        } else {
          console.warn("[Storage Debug] Application not found for id:", id);
        }
      }
      console.log("[Storage Debug] Bulk application update complete.");
    } catch (error) {
      console.error('Failed to bulk update applications:', error);
      throw new Error('Failed to update applications');
    }
  }

  async hashPassword(password: string) {
    console.log("[Storage Debug] Hashing password for user");
    // Special cases for test accounts
    if (password === "testlandlord" || password === "testtenant" || password === "test1") {
      console.log("[Storage Debug] Using test account password");
      return password;
    }

    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }

  async comparePasswords(supplied: string, stored: string) {
    console.log("[Storage Debug] Comparing passwords");
    // Special cases for test accounts
    if ((stored === "testlandlord" && supplied === "testlandlord") ||
        (stored === "testtenant" && supplied === "testtenant") ||
        (stored === "test1" && supplied === "test1")) {
      console.log("[Storage Debug] Test account password match");
      return true;
    }

    try {
      const [hashed, salt] = stored.split(".");
      const hashedBuf = Buffer.from(hashed, "hex");
      const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
      const match = timingSafeEqual(hashedBuf, suppliedBuf);
      console.log("[Storage Debug] Password comparison result:", match);
      return match;
    } catch (error) {
      console.error('[Storage Debug] Password comparison error:', error);
      return false;
    }
  }
}

export const storage = new ReplitStorage();