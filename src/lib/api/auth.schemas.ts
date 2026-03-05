import { z } from "zod";

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const LoginResponseSchema = z.object({
  access_token: z.string().min(1),
  token_type: z.string().default("bearer"),
  user_id: z.number().int().positive(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const HealthResponseSchema = z.object({
  message: z.string(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
