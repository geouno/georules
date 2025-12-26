declare module "bun" {
  interface Env {
    /** Turso database URL.
     * Can be a Turso cloud URL, SQLite database URL, or local database.
     *
     * For local development, use `:memory:` for in-memory or `file:///absolute/path` for file-based.
     * @example "http://127.0.0.1:8080"
     * @example "libsql://your-database.turso.io"
     * @example ":memory:"
     * @example "file:///absolute/path/to/database.db"
     */
    TURSO_DATABASE_URL: string;

    /** Turso authentication token.
     * Only required when using Turso cloud databases.
     *
     * @example "your-turso-auth-token" // Get from Turso dashboard.
     */
    TURSO_AUTH_TOKEN?: string;
  }
}
