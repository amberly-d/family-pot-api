import { describeDatabaseUrl } from './describe-database-url.js';

const LOCAL_HOSTS: ReadonlySet<string> = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
]);

/** True when the database URL points at this machine (localhost, 127.0.0.1, ::1). */
export function isLocalDatabaseUrl(databaseUrl: string): boolean {
  try {
    // URL keeps the brackets of an IPv6 host: "[::1]".
    const host = new URL(databaseUrl).hostname
      .toLowerCase()
      .replace(/^\[|\]$/g, '');
    return LOCAL_HOSTS.has(host);
  } catch {
    // Unknown means not provably local, so refuse.
    return false;
  }
}

export interface DestructiveGuardInput {
  /** What is about to happen, for the error message, e.g. "migration:revert". */
  action: string;
  databaseUrl: string;
  /** The ALLOW_REMOTE_DB_RESET override. */
  allowRemote: boolean;
}

export class DestructiveActionBlockedError extends Error {
  constructor(action: string, target: string) {
    super(
      `Refusing to run "${action}" against ${target}: it is not a local database. ` +
        'Destructive scripts only run against localhost, 127.0.0.1 or ::1. ' +
        'To run it anyway on a database you are sure is disposable, set ALLOW_REMOTE_DB_RESET=true.',
    );
    this.name = 'DestructiveActionBlockedError';
  }
}

/**
 * Call before anything that can destroy data (migration revert, test reset,
 * seed). Throws unless the host is local or the override is set. The message
 * never contains credentials.
 */
export function assertDestructiveAllowed({
  action,
  databaseUrl,
  allowRemote,
}: DestructiveGuardInput): void {
  if (allowRemote || isLocalDatabaseUrl(databaseUrl)) {
    return;
  }
  throw new DestructiveActionBlockedError(
    action,
    describeDatabaseUrl(databaseUrl),
  );
}
