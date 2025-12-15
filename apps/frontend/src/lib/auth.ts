import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: `http://${import.meta.env.VITE_BETTER_AUTH_URL!}`,
});
