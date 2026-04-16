import { z } from "zod";

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const LoginResponseSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  token_type: z.string().default("bearer"),
  user_id: z.number().int().positive(),
});

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const LogoutRequestSchema = z.object({
  refresh_token: z.string().min(1),
});

export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email(),
});

export const ForgotPasswordResponseSchema = z.object({
  message: z.string(),
  reset_token: z.string().optional().nullable(),
});

export const HealthResponseSchema = z.object({
  message: z.string(),
});

export const UserProfileSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  username: z.string().min(1),
  is_active: z.boolean(),
  is_superuser: z.boolean(),
  token_usage_millions: z.number().nonnegative(),
});

export const ProfileResetPasswordRequestSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8),
});

export const ChatSchema = z.object({
  id: z.string().uuid(),
  user_id: z.number().int().positive(),
  title: z.string().min(1),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const ChatListSchema = z.array(ChatSchema);

export const CreateChatRequestSchema = z.object({
  title: z.string().min(1).max(255),
});

export const RenameChatRequestSchema = z.object({
  title: z.string().min(1).max(255),
});

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------
export const MessageSchema = z.object({
  id: z.number().int().positive(),
  chat_room_id: z.string().uuid(),
  sender_role: z.enum(["user", "assistant", "system", "tool"]),
  content: z.string(),
  created_at: z.string().datetime(),
  message_metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const MessageListSchema = z.array(MessageSchema);

export const SendMessageRequestSchema = z.object({
  content: z.string().min(1),
  agent: z.enum(["langchain", "langgraph"]).default("langchain"),
});

// ---------------------------------------------------------------------------
// Itinerary
// ---------------------------------------------------------------------------
const ActivitySchema = z.object({
  time: z.string(),
  title: z.string(),
  description: z.string().optional().default(""),
  location: z.string().optional().default(""),
  // LLMs sometimes return quoted numbers — coerce to be safe
  lat: z.coerce.number().optional().default(0),
  lon: z.coerce.number().optional().default(0),
  duration_hours: z.coerce.number().optional(),
  category: z.string().optional(),
});

const DaySchema = z.object({
  day: z.number().int(),
  title: z.string(),
  activities: z.array(ActivitySchema),
});

export const ItineraryDataSchema = z.object({
  destination: z.string(),
  total_days: z.number().int(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  weather_summary: z.string().nullable().optional(),
  best_season: z.string().nullable().optional(),
  days: z.array(DaySchema),
  tips: z.array(z.string()).optional(),
  estimated_budget: z
    .object({
      currency: z.string().optional().default("USD"),
      accommodation_per_night: z.coerce.number().nullable().optional(),
      food_per_day: z.coerce.number().nullable().optional(),
      total_estimate: z.coerce.number().nullable().optional(),
    })
    .optional(),
});

export const ItinerarySchema = z.object({
  id: z.number().int().positive(),
  // UUID comes back as a string from the backend
  chat_room_id: z.string().uuid(),
  itinerary_data: ItineraryDataSchema,
  generated_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
