#!/usr/bin/env node
/**
 * Windows 11 License Health Checker
 *
 * SAFE UTILITY: This script does NOT activate Windows, change keys,
 * or touch KMS settings. It only runs read-only system queries and
 * prints a human-readable status summary.
 *
 * Usage:
 *   1. Open "Command Prompt" as Administrator.
 *   2. Run: node tools/win11-license-health-check.js
 *
 * Requirements:
 *   - Node.js installed
 *   - Windows 10/11 with "slmgr.vbs" available (default)
 */

const { execSync } = require('child_process');
const os = require('os');

function runSlmgr(arg) {
  try {
    const cmd = `cscript //Nologo "%windir%\\System32\\slmgr.vbs" ${arg}`;
    const out = execSync(cmd, { encoding: 'utf8' });
    return out;
  } catch (err) {
    return String(err.stdout || err.message || '').trim();
  }
}

function parseLicenseStatus(raw) {
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const info = {};

  for (const line of lines) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    info[key] = value;
  }

  return info;
}

function main() {
  console.log('=== Windows 11 License Health Check (read-only) ===\n');

  console.log(`Host name: ${os.hostname()}`);
  console.log(`Platform : ${os.platform()} ${os.release()}`);
  console.log('');

  console.log('[1/2] Querying detailed license information (slmgr /dlv)...');
  const dlvRaw = runSlmgr('/dlv');
  const dlvInfo = parseLicenseStatus(dlvRaw);

  console.log('\n--- Raw Summary (slmgr /dlv) ---');
  console.log(dlvRaw);
  console.log('--------------------------------\n');

  console.log('[2/2] Interpreted status:');
  const product = dlvInfo['Name'] || dlvInfo['Description'] || 'Unknown product';
  const licenseStatus = dlvInfo['License Status'] || 'Unknown';
  const kmsMachine = dlvInfo['KMS machine name'] || 'Not configured / Not applicable';
  const kmsPort = dlvInfo['KMS machine IP address'] || dlvInfo['KMS machine port'] || 'Unknown / Not applicable';

  console.log(`Product           : ${product}`);
  console.log(`License Status    : ${licenseStatus}`);
  console.log(`KMS Machine Name  : ${kmsMachine}`);
  console.log(`KMS Machine Info  : ${kmsPort}`);
  console.log('');

  console.log('Interpretation (non-legal, informational only):');
  console.log('- If "License Status" shows "Licensed", Windows currently considers this installation activated.');
  console.log('- If you see a KMS machine name, activation is tied to a KMS host (usually an organization KMS server).');
  console.log('- If activation is not genuine or you do not have a valid license, obtain a proper key from Microsoft or an authorized reseller.');
  console.log('');
  console.log('This script does not fix activation issues. It only helps you see how Windows is currently licensed so you can follow official support or licensing channels.');
}

if (require.main === module) {
  main();
}
