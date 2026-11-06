/**
 * Loads .env.local then .env for CLI scripts, like ConfigModule does for the
 * app. Existing environment variables win, and a missing file is fine.
 */
export function loadEnvFiles(): void {
  for (const file of ['.env.local', '.env']) {
    try {
      process.loadEnvFile(file);
    } catch {
      // File not present; fall back to the real environment.
    }
  }
}
