import { describe, expect, it } from 'vitest';
import { buildPostgresOptions } from './database-options.js';

const url = 'postgres://u:p@localhost:5432/db';

describe('buildPostgresOptions', () => {
  it('never enables synchronize', () => {
    expect(buildPostgresOptions({ url, ssl: false }).synchronize).toBe(false);
    expect(buildPostgresOptions({ url, ssl: true }).synchronize).toBe(false);
  });

  it('enables SSL only when requested', () => {
    expect(buildPostgresOptions({ url, ssl: true })).toMatchObject({
      ssl: true,
    });
    expect(buildPostgresOptions({ url, ssl: false })).not.toHaveProperty('ssl');
  });
});
