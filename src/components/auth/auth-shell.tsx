import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  footer: ReactNode;
  children: ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  footer,
  children,
}: AuthShellProps) {
  return (
    <main className="auth-page-shell flex min-h-screen items-center justify-center px-6 py-24">
      <div className="absolute inset-0 bg-grid mask-radial-fade opacity-70" />

      <section className="relative z-10 grid w-full max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="anim-fade-up space-y-6">
          <div className="inline-flex items-center rounded-full border border-cyan/35 bg-surface px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
            {eyebrow}
          </div>
          <div className="space-y-4">
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {title}
            </h1>
            <p className="max-w-lg text-base leading-7 text-muted sm:text-lg">
              {description}
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            <span aria-hidden="true">←</span>
            Back to landing page
          </Link>
        </div>

        <div className="anim-fade-up delay-1 relative">
          <div className="surface-panel rounded-[2rem] p-2">
            <div className="rounded-[1.5rem] border border-white/5 bg-background-dark/90 p-6 sm:p-8">
              {children}
              <div className="mt-6 text-center text-sm text-muted">
                {footer}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
