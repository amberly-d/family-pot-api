/**
 * A password-free description of a database URL, safe to put in logs and
 * error messages (a DATABASE_URL contains credentials).
 */
export function describeDatabaseUrl(databaseUrl: string): string {
  try {
    const url = new URL(databaseUrl);
    const port = url.port === '' ? '' : `:${url.port}`;
    const database = url.pathname.replace(/^\//, '');
    return `${url.hostname}${port}${database === '' ? '' : `/${database}`}`;
  } catch {
    return 'an unparseable DATABASE_URL';
  }
}
