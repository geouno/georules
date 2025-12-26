declare module "bun" {
  interface Env {
    /* Runtime environment. */
    NODE_ENV: "development" | "production" | "test";

    /** Minimum log level to output.
     * Options: "fatal", "error", "warn", "info", "debug", "trace", or "silent".
     * @example "debug" // Verbose logging for development.
     * @example "warn" // Only warnings, errors, and fatal errors.
     */
    LOG_LEVEL?: string;
  }
}
