import type { z } from "zod";

import type {
  ChatListSchema,
  ChatSchema,
  CreateChatRequestSchema,
  ForgotPasswordRequestSchema,
  ForgotPasswordResponseSchema,
  HealthResponseSchema,
  ItinerarySchema,
  LoginRequestSchema,
  LoginResponseSchema,
  LogoutRequestSchema,
  MessageListSchema,
  MessageSchema,
  ProfileResetPasswordRequestSchema,
  RegisterRequestSchema,
  RenameChatRequestSchema,
  SendMessageRequestSchema,
  UserProfileSchema,
} from "@/lib/schemas/auth.schemas";
import type {
  forgotPasswordFormSchema,
  loginFormSchema,
  registerFormSchema,
} from "@/lib/schemas/auth-form.schemas";

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LogoutRequest = z.infer<typeof LogoutRequestSchema>;
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;
export type ForgotPasswordResponse = z.infer<
  typeof ForgotPasswordResponseSchema
>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type ProfileResetPasswordRequest = z.infer<
  typeof ProfileResetPasswordRequestSchema
>;
export type Chat = z.infer<typeof ChatSchema>;
export type ChatList = z.infer<typeof ChatListSchema>;
export type CreateChatRequest = z.infer<typeof CreateChatRequestSchema>;
export type RenameChatRequest = z.infer<typeof RenameChatRequestSchema>;

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;

// Chat messages
export type Message = z.infer<typeof MessageSchema>;
export type MessageList = z.infer<typeof MessageListSchema>;
export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;

// Itinerary
export type Itinerary = z.infer<typeof ItinerarySchema>;
/** @deprecated Use ItineraryData from @/lib/schemas/auth.schemas instead */
export type ItineraryDay = Itinerary["itinerary_data"]["days"][number];
export type ItineraryActivity = ItineraryDay["activities"][number];
