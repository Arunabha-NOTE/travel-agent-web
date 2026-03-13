"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Globe } from "@/components/ui/globe";
import { TypingText } from "@/components/ui/typing-text";

export function LandingHero() {
  return (
    <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-6 pt-20 pb-12">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid mask-radial-fade" />

      {/* Hero content */}
      <div className="relative z-10 flex max-w-5xl flex-col items-center gap-6 text-center">
        <div className="relative flex min-h-[12rem] w-full items-center justify-center">
          <Globe className="top-1/2 z-0 -translate-y-[42%] opacity-60 [mask-image:radial-gradient(circle_at_center,black_0%,black_42%,transparent_74%)]" />
          <div className="pointer-events-none absolute inset-0" />

          <h1 className="anim-fade-up delay-1 relative z-10 text-5xl font-bold leading-[0.98] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            <span className="block">Plan Your Perfect</span>
            <TypingText
              text="Travel Itinerary"
              className="mt-0.5 block min-h-[1.05em] text-primary"
              speed={70}
              startDelay={350}
            />
          </h1>
        </div>

        {/* Subtitle */}
        <p className="anim-fade-up delay-2 -mt-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Describe your dream trip and get a personalized, day-by-day plan —
          powered by AI that retrieves real travel knowledge to craft
          unforgettable experiences.
        </p>

        {/* CTA buttons */}
        <div className="anim-fade-up delay-3 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="h-12 rounded-xl border-0 px-8 text-sm font-semibold"
          >
            <Link href="/register">Start Planning Free →</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 rounded-xl border border-selection bg-background-dark/55 px-8 text-sm font-medium text-foreground/75 backdrop-blur transition-all hover:border-purple/50 hover:bg-surface/55 hover:text-foreground"
          >
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
