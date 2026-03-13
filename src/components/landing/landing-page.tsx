"use client";

import { PlaneTakeoff } from "lucide-react";

import { LandingHero } from "@/components/landing/landing-hero";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { useBackendHealthQuery } from "@/lib/queries/auth.queries";

export function LandingPage() {
  const healthQuery = useBackendHealthQuery();
  const isOnline =
    !healthQuery.isLoading &&
    !healthQuery.isError &&
    !!healthQuery.data?.message;
  const statusLabel = healthQuery.isLoading
    ? "Checking backend..."
    : isOnline
      ? "All systems operational"
      : "Backend unavailable";
  const statusColor = healthQuery.isLoading
    ? "bg-orange"
    : isOnline
      ? "bg-green"
      : "bg-red";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNavbar />
      <LandingHero />

      <footer className="border-t border-selection/80 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-pink">
              <PlaneTakeoff aria-hidden="true" className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground">
              TravelAI
            </span>
          </div>

          <div className="flex flex-col items-start gap-2 text-xs text-muted sm:items-end">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block h-2 w-2 rounded-full ${statusColor}`}
              />
              <span>{statusLabel}</span>
            </div>
            <p>© 2026 TravelAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
