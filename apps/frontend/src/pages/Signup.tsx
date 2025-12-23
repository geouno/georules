import { revalidateLogic, useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { z } from "zod";
import { authClient } from "@/lib/auth";
import { setSessionCookies } from "@/lib/cookies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/**
 * Signup page for new users.
 * Redirects to dashboard on successful registration.
 */
export function SignupPage() {
  const [loading, setLoading] = useState(false);
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: formSchema,
    },
    onSubmit: async ({ value }) => {
      setLoading(true);
      await authClient.signUp.email(
        {
          name: value.name,
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            setSessionCookies();
            window.location.href = "/dash";
          },
          onError: (ctx) => {
            alert(ctx.error.message);
            setLoading(false);
          },
        },
      );
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-primary">
            Create Account
          </CardTitle>
          <CardDescription className="text-center">
            Sign up to start managing your georules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <form.Field
              name="name"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors
                    ? (
                      <p className="text-[0.8rem] font-medium text-destructive">
                        {field.state.meta.errors.map((e) => e?.message).join(
                          ", ",
                        )}
                      </p>
                    )
                    : null}
                </div>
              )}
            />
            <form.Field
              name="email"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="you@example.com"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors
                    ? (
                      <p className="text-[0.8rem] font-medium text-destructive">
                        {field.state.meta.errors.map((e) => e?.message).join(
                          ", ",
                        )}
                      </p>
                    )
                    : null}
                </div>
              )}
            />
            <form.Field
              name="password"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors
                    ? (
                      <p className="text-[0.8rem] font-medium text-destructive">
                        {field.state.meta.errors.map((e) => e?.message).join(
                          ", ",
                        )}
                      </p>
                    )
                    : null}
                </div>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Sign up"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
