/**
 * Runs before dev / build / type-check. The app imports data/project.json, so
 * a missing file would break the build: write an empty project instead, and
 * the UI shows "No map data yet". A file that isn't valid JSON stops here
 * with a readable message rather than a bundler stack trace.
 */
import fs from "node:fs";
import path from "node:path";

const DATA = path.resolve(import.meta.dirname, "..", "data", "project.json");

if (!fs.existsSync(DATA)) {
  fs.mkdirSync(path.dirname(DATA), { recursive: true });
  fs.writeFileSync(DATA, JSON.stringify({ name: "", rootScene: "", scenes: [] }, null, 1) + "\n");
  console.log("ℹ data/project.json was missing: wrote an empty project. Run npm run import-editor -- <backup.json> to add one.");
} else {
  try {
    JSON.parse(fs.readFileSync(DATA, "utf8"));
  } catch (error) {
    console.error(`✖ data/project.json is not valid JSON: ${error.message}\n  Fix it, or delete it to start from an empty project.`);
    process.exit(1);
  }
}
