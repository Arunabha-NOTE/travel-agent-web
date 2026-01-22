import { z } from "zod";

// Add client-safe variables here.
// Example:
//   NEXT_PUBLIC_API_BASE_URL: z.string().url(),
const ClientEnvSchema = z.object({
  // NEXT_PUBLIC_API_BASE_URL: z.string().url(),
});

type ClientEnv = z.infer<typeof ClientEnvSchema>;

function readClientEnv(): ClientEnv {
  const raw = {
    // NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  };

  const parsed = ClientEnvSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `Invalid client environment variables:\n${parsed.error.message}`,
    );
  }

  return parsed.data;
}

/** Client-safe env (ONLY NEXT_PUBLIC_* values). */
export const clientEnv = readClientEnv();
