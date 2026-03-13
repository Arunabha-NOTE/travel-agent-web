"use client";

import Link from "next/link";
import { useState } from "react";

import { TokenUsageCard } from "@/components/profile/token-usage-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useProfileQuery,
  useProfileResetPasswordMutation,
} from "@/lib/queries/auth.queries";

export default function ProfilePage() {
  const profileQuery = useProfileQuery();
  const resetPasswordMutation = useProfileResetPasswordMutation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  async function onResetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await resetPasswordMutation.mutateAsync({
      current_password: currentPassword,
      new_password: newPassword,
    });
    setCurrentPassword("");
    setNewPassword("");
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 md:px-8">
      <div className="mx-auto grid w-full max-w-4xl gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-foreground/80">
            {profileQuery.isLoading ? <p>Loading profile...</p> : null}
            {profileQuery.isError ? (
              <p className="text-red-600">Unable to load profile.</p>
            ) : null}

            {profileQuery.data ? (
              <>
                <p>
                  Username:{" "}
                  <span className="font-semibold text-foreground">
                    {profileQuery.data.username}
                  </span>
                </p>
                <p>
                  Email:{" "}
                  <span className="font-semibold text-foreground">
                    {profileQuery.data.email}
                  </span>
                </p>
              </>
            ) : null}

            <Link className="inline-block text-sm underline" href="/chat">
              Back to chats
            </Link>
          </CardContent>
        </Card>

        <TokenUsageCard
          tokenUsageMillions={profileQuery.data?.token_usage_millions ?? 0}
        />

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Reset password</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 md:grid-cols-2"
              onSubmit={onResetPassword}
            >
              <div className="space-y-2">
                <Label htmlFor="current-password">Current password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <div className="md:col-span-2">
                <Button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending
                    ? "Updating password..."
                    : "Update password"}
                </Button>
              </div>
            </form>

            {resetPasswordMutation.isError ? (
              <p className="mt-3 text-sm text-red-600">
                Password reset failed.
              </p>
            ) : null}

            {resetPasswordMutation.isSuccess ? (
              <p className="mt-3 text-sm text-green-600">
                Password updated successfully.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
