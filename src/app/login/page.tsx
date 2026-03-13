"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { parseApiError } from "@/lib/api/errors";
import {
  type LoginFormValues,
  loginFormSchema,
} from "@/lib/auth/auth-form-schemas";
import {
  useLoginMutation,
  useLogoutMutation,
} from "@/lib/queries/auth.queries";

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);

    try {
      await loginMutation.mutateAsync(values);
      router.push("/chat");
    } catch (error) {
      const parsed = parseApiError(error, "Unable to sign in. Try again.");

      if (parsed.status === 401 || parsed.code === "UNAUTHORIZED") {
        form.setError("password", {
          type: "server",
          message: parsed.message,
        });
      }

      setServerError(parsed.message);
    }
  }

  return (
    <AuthShell
      eyebrow="Account access"
      title="Pick up your trip plans where you left them."
      description="Sign in to your TravelAI workspace to continue refining itineraries, chats, and saved travel ideas."
      footer={
        <>
          <Link
            className="mr-4 underline-offset-4 hover:text-foreground hover:underline"
            href="/forgot-password"
          >
            Forgot password?
          </Link>
          <Link
            className="underline-offset-4 hover:text-foreground hover:underline"
            href="/register"
          >
            Create an account
          </Link>
        </>
      }
    >
      <div className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple">
          Login
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Welcome back
        </h2>
      </div>

      <div className="space-y-6">
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {serverError ? (
              <div className="rounded-xl border border-red/30 bg-red/10 px-4 py-3 text-sm text-red">
                {serverError}
              </div>
            ) : null}

            {loginMutation.isSuccess ? (
              <div className="rounded-xl border border-green/30 bg-green/10 px-4 py-3 text-sm text-green">
                Login successful.
              </div>
            ) : null}

            <Button
              className="shimmer-btn w-full"
              type="submit"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </Button>

            <Button
              className="w-full"
              type="button"
              variant="outline"
              disabled={logoutMutation.isPending}
              onClick={() => logoutMutation.mutate()}
            >
              {logoutMutation.isPending ? "Signing out..." : "Sign out"}
            </Button>
          </form>
        </Form>
      </div>
    </AuthShell>
  );
}
