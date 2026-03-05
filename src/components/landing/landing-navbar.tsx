import Link from "next/link";

import { Button } from "@/components/ui/button";

export function LandingNavbar() {
  return (
    <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
      <div className="text-lg font-semibold">Chatbot</div>
      <Button asChild>
        <Link href="/login">Login</Link>
      </Button>
    </nav>
  );
}
