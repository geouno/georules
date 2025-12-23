import { GeorulesClient } from "@georules/core";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Singleton client instance for the frontend.
 * Uses credentials (cookies) for authentication.
 */
export const georulesClient = new GeorulesClient(API_URL, {
  useCredentials: true,
});
