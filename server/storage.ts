import { users, properties, applications } from "@shared/schema";
import type { InsertUser, User, Property, Application } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

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

export class MemStorage implements IStorage {
  sessionStore: session.Store;
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private applications: Map<number, Application>;
  private currentIds: {
    users: number;
    properties: number;
    applications: number;
  };

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    this.users = new Map();
    this.properties = new Map();
    this.applications = new Map();
    this.currentIds = {
      users: 1,
      properties: 1,
      applications: 1,
    };
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async createProperty(insertProperty: Omit<Property, "id" | "createdAt">): Promise<Property> {
    const id = this.currentIds.properties++;
    const property: Property = {
      ...insertProperty,
      id,
      createdAt: new Date()
    };
    this.properties.set(id, property);
    return property;
  }

  async getAllProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }

  async getPropertyById(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async createApplication(insertApplication: Omit<Application, "id" | "createdAt">): Promise<Application> {
    const id = this.currentIds.applications++;
    const application: Application = {
      ...insertApplication,
      id,
      createdAt: new Date()
    };
    this.applications.set(id, application);
    return application;
  }

  async getTenantApplications(tenantId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(
      (app) => app.tenantId === tenantId
    );
  }

  async getLandlordApplications(landlordId: number): Promise<Application[]> {
    const landlordProperties = Array.from(this.properties.values())
      .filter((prop) => prop.landlordId === landlordId)
      .map((prop) => prop.id);
    
    return Array.from(this.applications.values())
      .filter((app) => landlordProperties.includes(app.propertyId));
  }
}

export const storage = new MemStorage();
