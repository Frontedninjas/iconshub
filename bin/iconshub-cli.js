#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";

const args = process.argv.slice(2);

if (args[0] === "add") {
  const name = args[1];
  const file = args[2];

  if (!name || !file) {
    console.log("❌ Usage: iconlib add <icon-name> <icon-file.svg>");
    process.exit(1);
  }

  const dest = `src/icons/${name}.svg`;
  fs.copyFileSync(file, dest);

  console.log(`✨ Added: ${dest}`);
  console.log("⚙️  Generating library...");
  execSync("npm run generate", { stdio: "inherit" });
}

if (args[0] === "build") {
  console.log("⚙️ Building library...");
  execSync("npm run build", { stdio: "inherit" });
}

if (!args.length) {
  console.log(`
🎨 IconsHub CLI

Commands:
  iconshub add <name> <file.svg>    Add new icon
  iconshub build                    Build library
`);
}
