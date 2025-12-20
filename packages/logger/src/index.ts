import pino from "pino";
import path from "path";
import { fileURLToPath } from "url";

const isDev = process.env.NODE_ENV !== "production";

// Calculate the absolute path to the transport file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const transportTarget = path.join(__dirname, "transport.js");

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: isDev
    ? {
      target: transportTarget,
      options: {},
    }
    : undefined,
});
