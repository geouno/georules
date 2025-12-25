import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { rateLimit } from "elysia-rate-limit";
import { logger } from "@georules/logger";
import { auth } from "./auth";
import { rulesRouter } from "./routes/rules";
import { foldersRouter } from "./routes/folders";

const app = new Elysia()
  .use(cors({
    origin: process.env.TRUSTED_ORIGINS
      ? process.env.TRUSTED_ORIGINS.split(",")
      : true,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }))
  // Log incoming requests.
  .onRequest(({ request }) => {
    request.headers.set("x-start-time", Date.now().toString());
    logger.info({
      event: "http.request",
      method: request.method,
      path: new URL(request.url).pathname,
    }, "Incoming request.");
    console.log(app.server?.requestIP(request));
  })
  .onAfterResponse(({ request, set }) => {
    const startTime = Number(request.headers.get("x-start-time") || "0");
    const duration = Date.now() - startTime;
    logger.info({
      event: "http.response",
      method: request.method,
      path: new URL(request.url).pathname,
      status: set.status,
      duration,
    }, "Request completed.");
  })
  .get("/", () => "Hello, World.")
  .group("/api", (app) =>
    app
      .use(rulesRouter)
      .use(foldersRouter)
      .group("/auth", (app) =>
        app
          .use(
            rateLimit({
              duration: 60 * 1000, // 1 minute
              max: 10,
              errorResponse: "Too many requests.",
              scoping: "scoped",
              injectServer: () => app.server!,
              skip: () => process.env.NODE_ENV !== "production",
            }),
          )
          .use(
            rateLimit({
              duration: 7 * 24 * 60 * 1000, // 1 week
              max: 125,
              errorResponse: "Too many requests.",
              skip: () => process.env.NODE_ENV !== "production",
            }),
          )
          .all("/*", async ({ request, body }) => {
            if (request.bodyUsed) {
              const contentType = request.headers.get("content-type");
              if (contentType?.includes("application/json")) {
                const newRequest = new Request(request.url, {
                  method: request.method,
                  headers: request.headers,
                  body: JSON.stringify(body),
                });
                return await auth.handler(newRequest);
              }
            }
            return await auth.handler(request);
          }))
      .get("/health", () => "OK"));

export type App = typeof app;

if (import.meta.main) {
  try {
    const port = process.env.PORT || 3000;
    app.listen({
      port: Number(port),
      hostname: "0.0.0.0",
    }, () => {
      logger.info(
        `Elysia is running at ${app.server?.hostname}:${app.server?.port}.`,
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

export { app };
