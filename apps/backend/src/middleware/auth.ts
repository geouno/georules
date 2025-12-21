import { Elysia } from "elysia";
import { auth } from "../auth";

export const authMiddleware = new Elysia({ name: "auth-middleware" })
  .macro({
    betterAuthGuard: {
      async resolve({ request: { headers }, set }) {
        const session = await auth.api.getSession({
          headers,
        });

        if (!session) {
          set.status = 401;
          throw new Error("Unauthorized.");
        }

        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });
