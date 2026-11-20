import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const apiDir = path.join(root, 'app', 'api');
const backupDir = path.join(root, '.api-pages-backup');
const outDir = path.join(root, 'out');
const nextDir = path.join(root, '.next');

if (fs.existsSync(backupDir)) {
  if (!fs.existsSync(apiDir)) {
    fs.renameSync(backupDir, apiDir);
  } else {
    fs.rmSync(backupDir, { recursive: true, force: true });
  }
}

const hadApiDir = fs.existsSync(apiDir);

try {
  if (hadApiDir) {
    fs.renameSync(apiDir, backupDir);
  }

  // Clear stale Next type/build artifacts referencing /api/github before static export.
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
  }

  execSync('npx next build', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      STATIC_EXPORT: 'true',
      NEXT_PUBLIC_STATIC_EXPORT: 'true',
    },
  });

  if (fs.existsSync(outDir)) {
    fs.writeFileSync(path.join(outDir, '.nojekyll'), '');
  }
} finally {
  if (hadApiDir && fs.existsSync(backupDir) && !fs.existsSync(apiDir)) {
    fs.renameSync(backupDir, apiDir);
  }
}
