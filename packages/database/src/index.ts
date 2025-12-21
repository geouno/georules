import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// Connect to Turso (remote) or local SQLite database.
const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error(
    "[@georules/database] Missing TURSO_DATABASE_URL environment variable.\n" +
      "Please check your .env file in the application root.",
  );
}

if (!authToken && url.includes("turso.io")) {
  console.warn(
    "[@georules/database] TURSO_DATABASE_URL points to a remote Turso DB, but TURSO_AUTH_TOKEN is missing.\n" +
      "This might cause connection issues.",
  );
}

const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });
