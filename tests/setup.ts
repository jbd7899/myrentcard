import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { db, pool } from '../server/db';
import { storage } from '../server/storage';
import * as schema from '@shared/schema';
import { sql } from 'drizzle-orm';

// Ensure we're using test database
if (!process.env.DATABASE_URL?.includes('test')) {
  throw new Error('Tests must be run against a test database');
}

beforeAll(async () => {
  // Verify database connection
  try {
    const client = await pool.connect();
    client.release();
    console.log('[Test Setup] Successfully connected to test database');

    // Create database_versions table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS database_versions (
        id SERIAL PRIMARY KEY,
        version VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN NOT NULL DEFAULT true
      );
    `);
  } catch (err) {
    console.error('[Test Setup] Database connection failed:', err);
    throw err;
  }
});

beforeEach(async () => {
  // Clear test data before each test
  await db.delete(schema.databaseVersions);
  await storage.clearTestAccounts();
});

afterAll(async () => {
  await pool.end();
});