import { build } from "esbuild";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildServer() {
  try {
    const result = await build({
      entryPoints: [resolve(__dirname, "index.ts")],
      bundle: true,
      platform: "node",
      target: "node20",
      outdir: resolve(__dirname, "../dist/server"),
      format: "esm",
      packages: "external",
      sourcemap: true,
      minify: process.env.NODE_ENV === "production",
      banner: {
        js: `
          import { createRequire } from 'module';
          const require = createRequire(import.meta.url);
        `,
      },
    });

    if (result.errors.length > 0) {
      console.error("Build failed:", result.errors);
      process.exit(1);
    }

    console.log("Server build completed successfully");
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

buildServer();