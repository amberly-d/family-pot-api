import { describe, expect, it } from 'vitest';
import {
  assertDestructiveAllowed,
  DestructiveActionBlockedError,
  isLocalDatabaseUrl,
} from './destructive-guard.js';

const guard = (databaseUrl: string, allowRemote = false) =>
  assertDestructiveAllowed({
    action: 'migration:revert',
    databaseUrl,
    allowRemote,
  });

describe('isLocalDatabaseUrl', () => {
  it.each([
    'postgres://u:p@localhost:5432/db',
    'postgres://u:p@LOCALHOST/db',
    'postgresql://u:p@127.0.0.1:5432/db',
    'postgres://u:p@[::1]:5432/db',
  ])('accepts %s', (url) => {
    expect(isLocalDatabaseUrl(url)).toBe(true);
  });

  it.each([
    'postgres://u:p@db.example.neon.tech/db',
    'postgres://u:p@localhost.evil.com/db',
    'postgres://u:p@127.0.0.1.nip.io/db',
    'postgres://localhost:secret@evil.com/db',
    'postgres:///db',
    'not a url',
  ])('rejects %s', (url) => {
    expect(isLocalDatabaseUrl(url)).toBe(false);
  });
});

describe('assertDestructiveAllowed', () => {
  it('allows a local database', () => {
    expect(() => guard('postgres://u:p@localhost:5432/db')).not.toThrow();
  });

  it('blocks a remote database without leaking the password', () => {
    const url = 'postgres://user:hunter2@db.remote.example:5432/prod';
    expect(() => guard(url)).toThrow(DestructiveActionBlockedError);
    expect(() => guard(url)).toThrow(/db\.remote\.example:5432\/prod/);
    expect(() => guard(url)).not.toThrow(/hunter2/);
  });

  it('allows a remote database with the override', () => {
    expect(() =>
      guard('postgres://u:p@db.remote.example/db', true),
    ).not.toThrow();
  });
});
