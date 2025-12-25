import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@georules/database";
import { bearer } from "better-auth/plugins";
import { logger } from "@georules/logger";
import { createAuthMiddleware } from "better-auth/api";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: process.env.TRUSTED_ORIGINS?.split(",") || [],
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: true,
      domain: process.env.NODE_ENV === "production"
        ? process.env.BETTER_AUTH_COOKIE_DOMAIN
        : undefined,
    },
    defaultCookieAttributes: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
    cookiePrefix: "georules",
  },
  plugins: [
    bearer(),
  ],
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // Log login events.
      if (ctx.path.startsWith("/sign-in")) {
        const newSession = ctx.context.newSession;
        if (newSession) {
          logger.info({
            event: "auth.login.success",
            userId: newSession.user.id,
            email: newSession.user.email,
            ip: ctx.headers?.get("x-forwarded-for") || "unknown",
          }, "User logged in successfully.");
        } else {
          logger.info({
            event: "auth.login.failure",
            ip: ctx.headers?.get("x-forwarded-for") || "unknown",
            reason: "No session created during login",
          }, "User login failed.");
        }
      }

      // Log registration events.
      if (ctx.path.startsWith("/sign-up")) {
        const newSession = ctx.context.newSession;
        if (newSession) {
          logger.info({
            event: "auth.register.success",
            userId: newSession.user.id,
            email: newSession.user.email,
          }, "New user registered.");
        } else {
          logger.info({
            event: "auth.register.failure",
            ip: ctx.headers?.get("x-forwarded-for") || "unknown",
            reason: "No session created during registration",
          }, "User registration failed.");
        }
      }
    }),
  },
});
