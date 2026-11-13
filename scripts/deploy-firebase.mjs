import { spawnSync } from 'node:child_process';
import { writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const { CONTEXT, BRANCH, FIREBASE_SERVICE_ACCOUNT } = process.env;

if (CONTEXT !== 'production' || BRANCH !== 'master') {
  console.log(`skipping Firebase deploy (CONTEXT=${CONTEXT ?? ''}, BRANCH=${BRANCH ?? ''})`);
  process.exit(0);
}

if (!FIREBASE_SERVICE_ACCOUNT) {
  console.error('ERROR: FIREBASE_SERVICE_ACCOUNT is not set; refusing to deploy. The live site is unchanged.');
  process.exit(1);
}

const dir = mkdtempSync(join(tmpdir(), 'fb-'));
const keyPath = join(dir, 'service-account.json');
let status = 1;
try {
  writeFileSync(keyPath, FIREBASE_SERVICE_ACCOUNT, { mode: 0o600 });
  const result = spawnSync('npx', ['firebase', 'deploy', '--only', 'hosting'], {
    stdio: 'inherit',
    env: { ...process.env, GOOGLE_APPLICATION_CREDENTIALS: keyPath },
  });
  status = result.status ?? 1;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
process.exit(status);
