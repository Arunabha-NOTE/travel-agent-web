"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      theme="dark"
      richColors
      closeButton
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--background-dark)",
          color: "var(--foreground)",
          border: "1px solid var(--border-subtle)",
        },
      }}
    />
  );
}
