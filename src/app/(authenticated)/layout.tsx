"use client";

import { useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden">
      <AppHeader onMenuClick={() => setIsSidebarOpen(true)} />
      <div className="flex-1 flex min-h-0 overflow-hidden px-4 py-4 md:px-6 md:py-6 gap-4 relative">
        <AppSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
