"use client";

import { useState } from "react";
import { TokenUsageCard } from "@/components/profile/token-usage-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfileQuery, useProfileResetPasswordMutation } from "@/lib/query";

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
    <div className="surface-panel h-full flex flex-col overflow-hidden rounded-[1.75rem]">
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto grid w-full max-w-4xl gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
              Account Settings
            </h1>
            <p className="text-sm text-muted mb-6">
              Manage your profile, password, and view your usage statistics.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-foreground/80">
              {profileQuery.isLoading ? <p>Loading profile...</p> : null}
              {profileQuery.isError ? (
                <p className="text-red-600">Unable to load profile.</p>
              ) : null}

              {profileQuery.data ? (
                <>
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted font-medium mb-1.5 block">
                      Username
                    </Label>
                    <p className="text-sm font-semibold text-foreground bg-surface/20 px-3 py-2 rounded-lg border border-selection/40">
                      {profileQuery.data.username}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted font-medium mb-1.5 block">
                      Email Address
                    </Label>
                    <p className="text-sm font-semibold text-foreground bg-surface/20 px-3 py-2 rounded-lg border border-selection/40">
                      {profileQuery.data.email}
                    </p>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          <TokenUsageCard
            tokenUsageMillions={profileQuery.data?.token_usage_millions ?? 0}
            totalTokens={profileQuery.data?.total_tokens}
            totalCost={profileQuery.data?.total_cost}
          />

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Security</CardTitle>
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
                    className="w-full md:w-auto"
                  >
                    {resetPasswordMutation.isPending
                      ? "Updating password..."
                      : "Update password"}
                  </Button>
                </div>
              </form>

              {resetPasswordMutation.isError ? (
                <p className="mt-4 text-sm text-red">
                  Password reset failed. Please check your current password.
                </p>
              ) : null}

              {resetPasswordMutation.isSuccess ? (
                <p className="mt-4 text-sm text-green-500">
                  Password updated successfully.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
