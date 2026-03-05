import { LandingHero } from "@/components/landing/landing-hero";
import { LandingNavbar } from "@/components/landing/landing-navbar";

export function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <LandingNavbar />
      <LandingHero />
    </main>
  );
}
