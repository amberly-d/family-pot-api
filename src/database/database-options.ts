import type { DataSourceOptions } from 'typeorm';

export type PostgresConnectionOptions = Extract<
  DataSourceOptions,
  { type: 'postgres' }
>;

export interface DatabaseOptionsInput {
  url: string;
  ssl: boolean;
}

/**
 * Connection options shared by the Nest module and the TypeORM CLI data source,
 * so the app and the migrations always talk to the database the same way.
 */
export function buildPostgresOptions({
  url,
  ssl,
}: DatabaseOptionsInput): PostgresConnectionOptions {
  return {
    type: 'postgres',
    url,
    // Only set when requested, so an `sslmode` in the URL still applies
    // otherwise. `true` makes pg verify the server certificate.
    ...(ssl ? { ssl: true } : {}),
    // gen_random_uuid() needs no extension on Postgres 13+; the extension is
    // created by the baseline migration, not at connect time.
    uuidExtension: 'pgcrypto',
    installExtensions: false,
    // Never enable synchronize. Schema changes go through migrations.
    synchronize: false,
    migrationsRun: false,
  };
}
