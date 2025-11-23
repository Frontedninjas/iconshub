#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

function fail(msg) {
  console.error("✖", msg);
  process.exitCode = 1;
}

function ok(msg) {
  console.log("✔", msg);
}

console.log("Running icon generator tests...");

try {
  execSync("node scripts/generate-icons.js", { stdio: "inherit" });
} catch (err) {
  fail(`Generator failed: ${err.message}`);
  process.exit(1);
}

const expected = [
  "src/generated/index.js",
  "src/raw/alertTriangle.js",
  "src/raw/linkedin.js",
  "src/react/AlertTriangleIcon.jsx",
  "src/react/LinkedinIcon.jsx",
  "src/svelte/alertTriangle.svelte",
  "src/svelte/linkedin.svelte",
  "src/vue/alertTriangle.vue",
  "src/vue/linkedin.vue",
];

let failed = false;
for (const p of expected) {
  if (!fs.existsSync(path.join(process.cwd(), p))) {
    fail(`Missing expected file: ${p}`);
    failed = true;
  } else {
    ok(`Found ${p}`);
  }
}

if (failed) {
  console.error("One or more tests failed.");
  process.exit(1);
}

console.log("All generator tests passed.");
