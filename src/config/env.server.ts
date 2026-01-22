import "server-only";
import { z } from "zod";

// Add server-only variables here.
// Example:
//   SENTRY_AUTH_TOKEN: z.string().min(1),
//   BACKEND_URL: z.string().url(),
const ServerEnvSchema = z.object({
  // SENTRY_AUTH_TOKEN: z.string().min(1),
  // BACKEND_URL: z.string().url(),
});

type ServerEnv = z.infer<typeof ServerEnvSchema>;

function readServerEnv(): ServerEnv {
  const raw = {
    // SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    // BACKEND_URL: process.env.BACKEND_URL,
  };

  const parsed = ServerEnvSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `Invalid server environment variables:\n${parsed.error.message}`,
    );
  }

  return parsed.data;
}

/** Server-only env (safe to import from server components, route handlers, API routes). */
export const serverEnv = readServerEnv();
