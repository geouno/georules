declare module "bun" {
  interface Env {
    // -- Runtime ---

    /** Runtime environment. */
    NODE_ENV: "development" | "production" | "test";

    // --- Server ---

    /** Server port. Falls back to 3000 if not set. */
    PORT: string;

    /** CORS allowed origins, comma-separated.
     *
     * Falls back to "*" (allow all) in development, and empty (allow none) in production if not set.
     */
    TRUSTED_ORIGINS: string;

    // --- Better Auth ---

    /** Better Auth secret key used for encryption and hashing.
     *
     * It must be at least 32 characters and generated with high entropy.
     *
     * **Recommendation**: Generate it with: `openssl rand -base64 32`.
     */
    BETTER_AUTH_SECRET: string;

    /** Better Auth base URL. Path defaults to `/api/auth` when not specified.
     * @example "http://localhost:3000"
     * // Defaults to
     * "http://localhost:3000/api/auth"
     * @example "http://localhost:3000/authentication" // Uses exact path provided.
     */
    BETTER_AUTH_URL: string;

    /** Better Auth domain for cross-subdomain sharing in production.
     * @example ".your-domain.com" // Enables auth cookies across subdomains.
     * @example "localhost" // For local development (no subdomain sharing).
     */
    BETTER_AUTH_COOKIE_DOMAIN?: string;

    // --- Database ---

    /* Turso database URL.
     * Can be a Turso cloud URL, SQLite database URL, or local database.
     *
     * For local development, use `:memory:` for in-memory or `file:///absolute/path` for file-based.
     * @example "http://127.0.0.1:8080"
     * @example "libsql://your-database.turso.io"
     * @example ":memory:"
     * @example "file:///absolute/path/to/database.db"
     */
    TURSO_DATABASE_URL: string;

    /* Turso authentication token.
     * Only required when using Turso cloud databases.
     *
     * @example "your-turso-auth-token" // Get from Turso dashboard.
     */
    TURSO_AUTH_TOKEN?: string;

    // --- Logging ---

    /* Minimum log level to output.
     * Options: "fatal", "error", "warn", "info", "debug", "trace", or "silent".
     * @example "debug" // Verbose logging for development.
     * @example "warn" // Only warnings, errors, and fatal errors.
     */
    LOG_LEVEL?: string;
  }
}
