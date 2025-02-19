import { storage } from "../storage";
import { InsertDatabaseVersion } from "@shared/schema";

export async function getCurrentVersion(): Promise<void> {
  const version = await storage.getCurrentVersion();
  if (!version) {
    console.log("No active database version found");
    return;
  }
  console.log(`Current version: ${version.version}`);
  console.log(`Description: ${version.description}`);
  console.log(`Applied at: ${version.appliedAt}`);
}

export async function listVersions(): Promise<void> {
  const versions = await storage.listVersions();
  if (versions.length === 0) {
    console.log("No database versions found");
    return;
  }

  console.log("\nDatabase Version History:");
  console.log("------------------------");
  versions.forEach((version) => {
    console.log(`\nVersion: ${version.version}`);
    console.log(`Description: ${version.description}`);
    console.log(`Applied at: ${version.appliedAt}`);
    console.log(`Status: ${version.isActive ? 'Active' : 'Inactive'}`);
  });
}

export async function rollbackToVersion(version: string): Promise<void> {
  try {
    await storage.rollbackToVersion(version);
    console.log(`Successfully rolled back to version ${version}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Failed to rollback: ${error.message}`);
    } else {
      console.error("An unknown error occurred during rollback");
    }
    process.exit(1);
  }
}
