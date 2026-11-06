import { assertDestructiveAllowed } from './destructive-guard.js';
import { loadEnvFiles } from './load-env.js';

// Usage: node dist/database/guard-cli.js <action> [--test]
// Exits non-zero when <action> must not run against the configured database.
// Chain it before any destructive script: `guard-cli.js seed && node seed.js`.
loadEnvFiles();

const [action, flag] = process.argv.slice(2);
const variable = flag === '--test' ? 'DATABASE_URL_TEST' : 'DATABASE_URL';
const databaseUrl = process.env[variable];

if (!action || !databaseUrl) {
  console.error(`Usage: guard-cli <action> [--test]. ${variable} must be set.`);
  process.exit(1);
}

try {
  assertDestructiveAllowed({
    action,
    databaseUrl,
    allowRemote: process.env.ALLOW_REMOTE_DB_RESET === 'true',
  });
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}
