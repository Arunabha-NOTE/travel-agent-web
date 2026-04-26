"use client";

import Link from "next/link";

import { Icons } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { useProfileQuery } from "@/lib/query";

export function LandingNavbar() {
  const { PlaneTakeoff } = Icons;
  const { data: profile, isLoading } = useProfileQuery();

  const isAuthenticated = !!profile;

  return (
    <header className="fixed top-0 z-50 w-full border-b border-selection/60 bg-background-dark/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
            <PlaneTakeoff aria-hidden="true" className="h-4 w-4 text-white" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-white">
            TravelAI
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Button
              asChild
              className="h-9 rounded-lg border-0 px-4 text-sm font-medium"
            >
              <Link href="/chat">Go to Chat</Link>
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                asChild
                className="h-9 text-sm text-muted hover:bg-surface/45 hover:text-foreground"
              >
                <Link href="/login">Sign In</Link>
              </Button>
              <Button
                asChild
                className="h-9 rounded-lg border-0 px-4 text-sm font-medium"
              >
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
