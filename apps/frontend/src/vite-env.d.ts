/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Better Auth API URL. Path defaults to `/api/auth` when not specified.
   * @example "http://localhost:3000"
   * // Defaults to
   * "http://localhost:3000/api/auth"
   * @example "http://localhost:3000/authentication" // Uses exact path provided.
   */
  readonly VITE_BETTER_AUTH_URL: string;

  /** Georules API URL. */
  readonly VITE_API_URL: string;

  // --- Assets ---

  /** Favicon URL. */
  readonly VITE_FAVICON_URL: string;

  /** Logo URL (1024x1024). */
  readonly VITE_LOGO_1024_URL: string;

  /** Logo URL (256x256). */
  readonly VITE_LOGO_256_URL: string;

  /** Logo URL (256x256, lightweight/optimized version). */
  readonly VITE_LOGO_256_LITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
