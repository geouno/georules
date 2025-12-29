/**
 * Centralized configuration for application assets (S3/CDN URLs).
 *
 * Asset URLs are sourced from environment variables.
 */
export const assets = {
  /** Favicon URL. */
  favicon: import.meta.env.VITE_FAVICON_URL || "/favicon.ico",

  /** Logo variants. */
  logo: {
    /** High-resolution logo (1024x1024). */
    "1024x": import.meta.env.VITE_LOGO_1024_URL || "",
    /** Standard logo (256x256). */
    "256x": import.meta.env.VITE_LOGO_256_URL || "",
    /** Lightweight/optimized logo (256x256). */
    "256x-lite": import.meta.env.VITE_LOGO_256_LITE_URL || "",
  },
} as const;
