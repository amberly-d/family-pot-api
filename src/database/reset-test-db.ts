import { assertDestructiveAllowed } from './destructive-guard.js';
import { buildCliDataSource } from './data-source.js';
import { loadEnvFiles } from './load-env.js';

// Drops everything in the TEST database and re-applies migrations.
// Only ever touches DATABASE_URL_TEST, and only if the guard allows it.
loadEnvFiles();

const url = process.env.DATABASE_URL_TEST;
if (!url) {
  console.error('DATABASE_URL_TEST must be set to reset the test database.');
  process.exit(1);
}

try {
  assertDestructiveAllowed({
    action: 'test:reset',
    databaseUrl: url,
    allowRemote: process.env.ALLOW_REMOTE_DB_RESET === 'true',
  });
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}

const dataSource = buildCliDataSource(url);
await dataSource.initialize();
try {
  await dataSource.dropDatabase();
  await dataSource.runMigrations();
  console.log('Test database reset and migrated.');
} finally {
  await dataSource.destroy();
}
