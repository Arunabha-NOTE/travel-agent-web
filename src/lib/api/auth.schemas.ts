import { z } from "zod";

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const LoginResponseSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  token_type: z.string().default("bearer"),
  user_id: z.number().int().positive(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LogoutRequestSchema = z.object({
  refresh_token: z.string().min(1),
});

export type LogoutRequest = z.infer<typeof LogoutRequestSchema>;

export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;

export const ForgotPasswordResponseSchema = z.object({
  message: z.string(),
  reset_token: z.string().optional().nullable(),
});

export type ForgotPasswordResponse = z.infer<
  typeof ForgotPasswordResponseSchema
>;

export const HealthResponseSchema = z.object({
  message: z.string(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export const UserProfileSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  username: z.string().min(1),
  is_active: z.boolean(),
  is_superuser: z.boolean(),
  token_usage_millions: z.number().nonnegative(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export const ProfileResetPasswordRequestSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8),
});

export type ProfileResetPasswordRequest = z.infer<
  typeof ProfileResetPasswordRequestSchema
>;

export const ChatSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  title: z.string().min(1),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Chat = z.infer<typeof ChatSchema>;

export const ChatListSchema = z.array(ChatSchema);

export const CreateChatRequestSchema = z.object({
  title: z.string().min(1).max(255),
});

export type CreateChatRequest = z.infer<typeof CreateChatRequestSchema>;

export const RenameChatRequestSchema = z.object({
  title: z.string().min(1).max(255),
});

export type RenameChatRequest = z.infer<typeof RenameChatRequestSchema>;
