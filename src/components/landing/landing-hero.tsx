"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useBackendHealthQuery } from "@/lib/queries/auth.queries";

export function LandingHero() {
  const healthQuery = useBackendHealthQuery();

  return (
    <section className="mx-auto flex w-full max-w-4xl px-6 pb-24 pt-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Travel assistant chatbot</CardTitle>
          <CardDescription>
            Plan trips and get instant itinerary suggestions through a secure
            JWT-based auth flow.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="text-sm text-foreground/70">
            Backend status:{" "}
            {healthQuery.isLoading
              ? "Checking..."
              : healthQuery.isError
                ? "Unavailable"
                : (healthQuery.data?.message ?? "Unavailable")}
          </div>
          <div className="flex items-center gap-3">
            <Button asChild size="lg">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
