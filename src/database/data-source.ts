import { join } from 'node:path';
import { DataSource } from 'typeorm';
import {
  buildPostgresOptions,
  type PostgresConnectionOptions,
} from './database-options.js';
import { loadEnvFiles } from './load-env.js';

// Used by the TypeORM CLI (migration scripts in package.json). It runs against
// the compiled output in dist/, so entity and migration globs match .js files.
loadEnvFiles();

export function buildCliDataSource(
  url: string | undefined,
  overrides: Partial<PostgresConnectionOptions> = {},
): DataSource {
  return new DataSource({
    ...buildPostgresOptions({
      url: url ?? '',
      ssl: process.env.DATABASE_SSL === 'true',
    }),
    entities: [join(import.meta.dirname, '..', '**', '*.entity.js')],
    migrations: [join(import.meta.dirname, 'migrations', '*.js')],
    ...overrides,
  });
}

export default buildCliDataSource(process.env.DATABASE_URL);
