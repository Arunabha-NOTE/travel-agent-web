"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  type ForgotPasswordFormValues,
  forgotPasswordFormSchema,
} from "@/lib/auth/auth-form-schemas";
import { useForgotPasswordMutation } from "@/lib/queries/auth.queries";

export default function ForgotPasswordPage() {
  const forgotPasswordMutation = useForgotPasswordMutation();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setServerError(null);

    try {
      await forgotPasswordMutation.mutateAsync(values);
    } catch (error) {
      setServerError(
        getApiErrorMessage(error, "Unable to process request. Try again."),
      );
    }
  }

  return (
    <AuthShell
      eyebrow="Password recovery"
      title="Reset access without losing your travel context."
      description="Send a reset request and we will start the password recovery flow for your TravelAI account."
      footer={
        <Link
          className="underline-offset-4 hover:text-foreground hover:underline"
          href="/login"
        >
          Back to login
        </Link>
      }
    >
      <div className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-pink">
          Forgot password
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Recover your account
        </h2>
        <p className="text-sm leading-6 text-muted">
          Enter the email linked to your account and we will initiate password
          reset.
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

            {serverError ? (
              <div className="rounded-xl border border-red/30 bg-red/10 px-4 py-3 text-sm text-red">
                {serverError}
              </div>
            ) : null}

            {forgotPasswordMutation.isSuccess ? (
              <div className="rounded-xl border border-green/30 bg-green/10 px-4 py-3 text-sm text-green">
                {forgotPasswordMutation.data.message}
              </div>
            ) : null}

            <Button
              className="shimmer-btn w-full"
              type="submit"
              disabled={forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending
                ? "Submitting..."
                : "Send reset request"}
            </Button>
          </form>
        </Form>
      </div>
    </AuthShell>
  );
}
