import { beforeEach, describe, expect, it } from "vitest";
import { storage } from "../server/storage";
import { db } from "../server/db";
import { databaseVersions } from "@shared/schema";

describe("Database Version Control", () => {
  beforeEach(async () => {
    // Clear existing versions for clean test state
    await db.delete(databaseVersions);
  });

  it("should return undefined when no versions exist", async () => {
    const currentVersion = await storage.getCurrentVersion();
    expect(currentVersion).toBeUndefined();
  });

  it("should add a new version and set it as active", async () => {
    const version = {
      version: "1.0.0",
      description: "Initial schema",
      isActive: true,
    };

    const newVersion = await storage.addVersion(version);
    expect(newVersion.version).toBe("1.0.0");
    expect(newVersion.isActive).toBe(true);

    const currentVersion = await storage.getCurrentVersion();
    expect(currentVersion?.version).toBe("1.0.0");
  });

  it("should list all versions in descending order", async () => {
    const versions = [
      { version: "1.0.0", description: "Initial schema", isActive: false },
      { version: "1.1.0", description: "Added user profiles", isActive: true },
    ];

    for (const version of versions) {
      await storage.addVersion(version);
    }

    const listedVersions = await storage.listVersions();
    expect(listedVersions).toHaveLength(2);
    expect(listedVersions[0].version).toBe("1.1.0"); // Most recent first
    expect(listedVersions[1].version).toBe("1.0.0");
  });

  it("should rollback to a specific version", async () => {
    const versions = [
      { version: "1.0.0", description: "Initial schema", isActive: false },
      { version: "1.1.0", description: "Added user profiles", isActive: true },
    ];

    for (const version of versions) {
      await storage.addVersion(version);
    }

    await storage.rollbackToVersion("1.0.0");

    const currentVersion = await storage.getCurrentVersion();
    expect(currentVersion?.version).toBe("1.0.0");
    expect(currentVersion?.isActive).toBe(true);

    const version110 = (await storage.listVersions()).find(v => v.version === "1.1.0");
    expect(version110?.isActive).toBe(false);
  });
});