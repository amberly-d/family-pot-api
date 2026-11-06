import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppConfigService } from '../src/config/app-config.service.js';
import { AppConfigModule } from '../src/config/app-config.module.js';
import { buildCliDataSource } from '../src/database/data-source.js';
import {
  DatabaseConnectionError,
  DatabaseModule,
} from '../src/database/database.module.js';
import { Baseline1700000000000 } from '../src/database/migrations/1700000000000-Baseline.js';
import { assertDestructiveAllowed } from '../src/database/destructive-guard.js';

// Requires a reachable Postgres at DATABASE_URL_TEST (see .env.example).
describe('Database (integration)', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    const url = process.env.DATABASE_URL!;
    // This test wipes the schema, so it uses the same guard as the scripts.
    assertDestructiveAllowed({
      action: 'e2e:database',
      databaseUrl: url,
      allowRemote: process.env.ALLOW_REMOTE_DB_RESET === 'true',
    });
    dataSource = buildCliDataSource(url, {
      migrations: [Baseline1700000000000],
    });
    await dataSource.initialize();
    await dataSource.dropDatabase();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('connects', async () => {
    await expect(dataSource.query('SELECT 1 AS ok')).resolves.toEqual([
      { ok: 1 },
    ]);
  });

  it('runs and reverts migrations on a clean database', async () => {
    const applied = await dataSource.runMigrations();
    expect(applied.map((m) => m.name)).toContain('Baseline1700000000000');
    await expect(
      dataSource.query("SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto'"),
    ).resolves.toHaveLength(1);

    await dataSource.undoLastMigration();
    await expect(dataSource.query('SELECT * FROM migrations')).resolves.toEqual(
      [],
    );
  });

  it('fails with a clear error when the database is unreachable', async () => {
    const moduleRef = Test.createTestingModule({
      imports: [AppConfigModule, DatabaseModule],
    })
      .overrideProvider(AppConfigService)
      .useValue({
        databaseUrl: 'postgres://u:secretpw@127.0.0.1:1/nope',
        databaseSsl: false,
      })
      .compile();

    const error = await moduleRef.then(
      () => undefined,
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(DatabaseConnectionError);
    expect((error as Error).message).toContain('127.0.0.1:1/nope');
    expect((error as Error).message).not.toContain('secretpw');
  }, 20_000);
});
