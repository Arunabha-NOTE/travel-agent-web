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
import { useRegisterMutation } from "@/lib/query";
import { registerFormSchema } from "@/lib/schemas";
import type { RegisterFormValues } from "@/lib/types";
import { getApiErrorMessage } from "@/lib/utils/api-error";

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegisterMutation();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null);

    try {
      await registerMutation.mutateAsync({
        email: values.email,
        password: values.password,
      });
      router.push("/chat");
    } catch (error) {
      setServerError(
        getApiErrorMessage(
          error,
          "Unable to create account. The email may already be in use.",
        ),
      );
    }
  }

  return (
    <AuthShell
      eyebrow="Create account"
      title="Start building better itineraries in minutes."
      description="Create your TravelAI account to unlock saved chats, editable plans, and a faster path from inspiration to itinerary."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Sign in
          </Link>
        </>
      }
    >
      <div className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan">
          Register
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Create your account
        </h2>
        <p className="text-sm leading-6 text-muted">
          Use your email and a strong password to start planning personalized
          trips.
        </p>
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
                    <PasswordInput autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <PasswordInput autoComplete="new-password" {...field} />
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

            {registerMutation.isSuccess ? (
              <div className="rounded-xl border border-green/30 bg-green/10 px-4 py-3 text-sm text-green">
                Account created successfully.
              </div>
            ) : null}

            <Button
              className="shimmer-btn w-full"
              type="submit"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending
                ? "Creating account..."
                : "Create account"}
            </Button>
          </form>
        </Form>
      </div>
    </AuthShell>
  );
}
