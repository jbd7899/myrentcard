import { getCurrentVersion, listVersions, rollbackToVersion } from "./version-control";

const command = process.argv[2];
const args = process.argv.slice(3);

async function main() {
  switch (command) {
    case "db:version":
      await getCurrentVersion();
      break;
    case "db:list":
      await listVersions();
      break;
    case "db:rollback":
      if (args.length !== 1) {
        console.error("Usage: npm run db:rollback <version>");
        process.exit(1);
      }
      await rollbackToVersion(args[0]);
      break;
    default:
      console.error("Unknown command. Available commands: db:version, db:list, db:rollback");
      process.exit(1);
  }
}

main().catch((error) => {
  console.error("Command failed:", error);
  process.exit(1);
});
