import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '../server/storage';
import { db } from '../server/db';
import { databaseVersions } from '@shared/schema';

describe('Database Version Control', () => {
  beforeEach(async () => {
    // Clear all versions before each test
    await db.delete(databaseVersions);
  });

  it('should create a new version', async () => {
    const version = await storage.addVersion({
      version: '1.0.0',
      description: 'Initial schema',
      isActive: true,
    });

    expect(version).toBeDefined();
    expect(version.version).toBe('1.0.0');
    expect(version.isActive).toBe(true);
  });

  it('should list all versions', async () => {
    // Add test versions
    await storage.addVersion({
      version: '1.0.1',
      description: 'Test version 1',
      isActive: false,
    });

    await storage.addVersion({
      version: '1.0.2',
      description: 'Test version 2',
      isActive: true,
    });

    const versions = await storage.listVersions();
    expect(versions.length).toBe(2);
    expect(versions[0].version).toBe('1.0.2'); // Most recent first
  });

  it('should get current version', async () => {
    // Add a test version that should be active
    await storage.addVersion({
      version: '1.0.0',
      description: 'Test active version',
      isActive: true,
    });

    const currentVersion = await storage.getCurrentVersion();
    expect(currentVersion).toBeDefined();
    expect(currentVersion?.isActive).toBe(true);
  });

  it('should rollback to a specific version', async () => {
    // Add test versions
    await storage.addVersion({
      version: '1.0.3',
      description: 'Old version',
      isActive: false,
    });

    await storage.addVersion({
      version: '1.0.4',
      description: 'Current version',
      isActive: true,
    });

    // Rollback to old version
    await storage.rollbackToVersion('1.0.3');

    // Verify rollback
    const currentVersion = await storage.getCurrentVersion();
    expect(currentVersion?.version).toBe('1.0.3');
    expect(currentVersion?.isActive).toBe(true);
  });
});