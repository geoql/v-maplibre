#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Read package.json
const packageJson = JSON.parse(
  readFileSync(join(rootDir, 'package.json'), 'utf-8'),
);

// Read jsr.json
const jsrJson = JSON.parse(readFileSync(join(rootDir, 'jsr.json'), 'utf-8'));

// Update jsr.json version
jsrJson.version = packageJson.version;

// Write back to jsr.json
writeFileSync(
  join(rootDir, 'jsr.json'),
  JSON.stringify(jsrJson, null, 2) + '\n',
);

console.log(`✅ Synced version ${packageJson.version} to jsr.json`);
