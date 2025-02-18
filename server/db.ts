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

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 15000,
  max: 5,
  idleTimeoutMillis: 60000,
  ssl: true
});

// Add event listeners for connection issues
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const db = drizzle(pool, { schema });

// Test the connection with retry logic
const testConnection = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      client.release();
      console.log("[Database] Successfully connected to database");
      return;
    } catch (err) {
      console.error(`[Database] Connection attempt ${i + 1} failed:`, err);
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

testConnection().catch(err => {
  console.error("[Database] All connection attempts failed:", err);
  process.exit(1);
});