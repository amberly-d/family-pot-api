import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Baseline: no business tables yet, only what every table will rely on. */
export class Baseline1700000000000 implements MigrationInterface {
  name = 'Baseline1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
  }

  public async down(): Promise<void> {
    // Intentionally empty: the extension may be used by other schemas.
  }
}
