#!/usr/bin/env node
/**
 * Seeds the Hardhat WASM compiler cache from the soljson.js already bundled
 * in node_modules/solc. This avoids downloading from binaries.soliditylang.org
 * in air-gapped or network-restricted environments (CI, Docker without egress,
 * remote sandboxes, etc.).
 *
 * Also patches the Hardhat downloader so Linux uses the WASM (JS) compiler
 * instead of trying to execute a native Linux binary — necessary because the
 * file placed in cache IS a JavaScript module, not a native ELF executable.
 *
 * Run once before `npx hardhat compile`.
 */

'use strict';
const path = require('path');
const fs   = require('fs');
const os   = require('os');

const FULL_VER    = 'v0.8.26+commit.8a97fa7a';
const CACHE_BASE  = path.join(os.homedir(), '.cache', 'hardhat-nodejs', 'compilers-v2');
const WASM_DIR    = path.join(CACHE_BASE, 'wasm');
const SOLJSON_SRC = require.resolve('solc/soljson');
const SOLJSON_DST = path.join(WASM_DIR, `soljson-${FULL_VER}.js`);

// ── 1. Write list.json ────────────────────────────────────────────────────────
fs.mkdirSync(WASM_DIR, { recursive: true });
fs.writeFileSync(
    path.join(WASM_DIR, 'list.json'),
    JSON.stringify({
        builds: [{
            path:        `soljson-${FULL_VER}.js`,
            version:     '0.8.26',
            build:       'commit.8a97fa7a',
            longVersion: '0.8.26+commit.8a97fa7a',
            keccak256:   '0x' + '0'.repeat(64),
            sha256:      '0x' + '0'.repeat(128),
            urls:        [],
        }],
        releases:      { '0.8.26': `soljson-${FULL_VER}.js` },
        latestRelease: '0.8.26',
    }, null, 2)
);

// ── 2. Copy bundled soljson.js ────────────────────────────────────────────────
fs.copyFileSync(SOLJSON_SRC, SOLJSON_DST);
console.log(`✅  Compiler cache seeded → ${SOLJSON_DST}`);

// ── 3. Patch Hardhat downloader: Linux → WASM ─────────────────────────────────
//       Without this, Hardhat treats the .js file as a native binary and
//       tries to spawn it with execFile, which fails with EACCES / ENOEXEC.
const DOWNLOADER = path.join(
    path.dirname(require.resolve('hardhat/package.json')),
    'internal/solidity/compiler/downloader.js'
);
const PATCH_FROM = 'case "linux":\n                return CompilerPlatform.LINUX;';
const PATCH_TO   = 'case "linux":\n                return CompilerPlatform.WASM;';

let src = fs.readFileSync(DOWNLOADER, 'utf8');
if (src.includes(PATCH_TO)) {
    console.log('ℹ️   Hardhat downloader already patched (WASM on Linux)');
} else if (src.includes(PATCH_FROM)) {
    src = src.replace(PATCH_FROM, PATCH_TO);
    fs.writeFileSync(DOWNLOADER, src);
    console.log('✅  Patched Hardhat downloader → Linux now uses WASM compiler');
} else {
    console.warn('⚠️   Could not find patch target in downloader.js — skipping');
}
