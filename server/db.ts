import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log("[Database] Connecting to database...");

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// Test the connection
pool.connect()
  .then(() => {
    console.log("[Database] Successfully connected to database");
  })
  .catch((err) => {
    console.error("[Database] Failed to connect to database:", err);
    process.exit(1);
  });