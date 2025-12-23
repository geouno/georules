import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
  RouterProvider,
} from "@tanstack/react-router";
import { Toaster } from "./components/ui/sonner";
import { LoginPage } from "./pages/Login";
import { SignupPage } from "./pages/Signup";
import { LandingPage } from "./pages/Landing";
import { DashboardPage } from "./pages/Dashboard";
import { authClient } from "./lib/auth";
import { isKnownUser } from "./lib/cookies";

// Create a QueryClient instance.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
});

const rootRoute = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: SignupPage,
});

const dashRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dash",
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      // Redirect to login if known user (has logged in before), otherwise to signup.
      throw redirect({ to: isKnownUser() ? "/login" : "/signup" });
    }
  },
  component: DashboardPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  signupRoute,
  dashRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return <RouterProvider router={router} />;
}

export default App;
