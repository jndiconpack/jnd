#!/usr/bin/env node
// Dependency-free validator for more_apps.json.
// Usage: node validate.mjs [path/to/more_apps.json]
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const file = resolve(
  process.argv[2] ?? resolve(here, "../../app/src/main/assets/more_apps.json")
);

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

let data;
try {
  data = JSON.parse(readFileSync(file, "utf8"));
} catch (e) {
  console.error(`FAIL ${file}\n  Invalid JSON: ${e.message}`);
  process.exit(1);
}

if (!Array.isArray(data) || data.length === 0) {
  console.error("FAIL Root must be a non-empty array of apps.");
  process.exit(1);
}

const ALLOWED = new Set(["name", "category", "description", "play_store_url", "images"]);
const PLAY_URL = /^https:\/\/play\.google\.com\/store\/apps\/details\?id=[A-Za-z0-9_.]+/;
const seenNames = new Map();
const seenIds = new Map();
const categories = new Map(); // lowercased -> Set of spellings

data.forEach((app, i) => {
