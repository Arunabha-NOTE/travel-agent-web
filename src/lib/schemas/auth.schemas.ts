import { z } from "zod";

const CHAT_TITLE_MAX_LENGTH = 80;
const CHAT_TITLE_CONTROL_CHAR_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/u;
const CHAT_TITLE_UNSUPPORTED_CHAR_RE = /[\uA9C5\u{1242B}]/u;

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const LoginResponseSchema = z.object({
  user_id: z.number().int().positive(),
});

export const RegisterRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password cannot exceed 128 characters"),
});

export const LogoutRequestSchema = z.object({}).default({});

export const ForgotPasswordRequestSchema = z.object({
  email: z.email(),
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
  email: z.email(),
  username: z.string().min(1),
  is_active: z.boolean(),
  is_superuser: z.boolean(),
  token_usage_millions: z.number().nonnegative(),
  total_tokens: z.number().int().nonnegative().optional(),
  total_cost: z.number().nonnegative().optional(),
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
  title: z
    .string()
    .trim()
    .min(1)
    .max(CHAT_TITLE_MAX_LENGTH)
    .refine(
      (value) => !CHAT_TITLE_CONTROL_CHAR_RE.test(value),
      "Chat title contains unsupported control characters",
    )
    .refine(
      (value) => !CHAT_TITLE_UNSUPPORTED_CHAR_RE.test(value),
      "Chat title contains unsupported characters",
    ),
});

export const RenameChatRequestSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1)
    .max(CHAT_TITLE_MAX_LENGTH)
    .refine(
      (value) => !CHAT_TITLE_CONTROL_CHAR_RE.test(value),
      "Chat title contains unsupported control characters",
    )
    .refine(
      (value) => !CHAT_TITLE_UNSUPPORTED_CHAR_RE.test(value),
      "Chat title contains unsupported characters",
    ),
});

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------
export const MessageSchema = z.object({
  id: z.number().int().positive(),
  chat_room_id: z.string().uuid(),
  sender_role: z.enum(["user", "assistant", "system", "tool"]),
  content: z.string(),
  prompt_tokens: z.number().int().nullable().optional(),
  completion_tokens: z.number().int().nullable().optional(),
  total_cost: z.number().nullable().optional(),
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

const TicketSchema = z
  .object({
    cost: z.coerce.number().nullable().optional(),
    currency: z.string().nullable().optional(),
    as_of: z.string().nullable().optional(),
    booking_url: z.string().nullable().optional(),
    advance_booking_required: z.boolean().optional().default(false),
    booking_lead_time: z.string().nullable().optional(),
  })
  .optional()
  .nullable();

const TransitSchema = z
  .object({
    mode: z.string().optional(),
    duration_mins: z.coerce.number().optional(),
    cost: z.coerce.number().nullable().optional(),
    currency: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  })
  .optional()
  .nullable();

const ActivitySchema = z.object({
  time: z.string(),
  duration_mins: z.coerce.number().optional(),
  /** kept for backward compat */
  duration_hours: z.coerce.number().optional(),
  title: z.string(),
  description: z.string().optional().default(""),
  location: z.string().optional().default(""),
  lat: z.coerce.number().optional().default(0),
  lon: z.coerce.number().optional().default(0),
  category: z.string().optional(),
  ticket: TicketSchema,
  opening_hours: z.string().nullable().optional(),
  transit_from_prev: TransitSchema,
  weather_tip: z.string().nullable().optional(),
  buffer_after_mins: z.coerce.number().optional(),
});

const DaySchema = z
  .object({
    day: z.number().int(),
    date: z.string().nullable().optional(),
    title: z.string().optional().default(""),
    day_notes: z.string().nullable().optional(),
    activities: z.array(ActivitySchema),
  })
  .transform((day) => ({
    ...day,
    title: day.title.trim() || `Day ${day.day}`,
  }));

const FlightSegmentSchema = z.object({
  airline: z.string(),
  flight_number: z.string().nullable().optional(),
  from_airport: z.string(),
  from_terminal: z.string().nullable().optional(),
  to_airport: z.string(),
  to_terminal: z.string().nullable().optional(),
  departure: z.string().nullable().optional(),
  arrival: z.string().nullable().optional(),
  duration_mins: z.coerce.number().optional(),
  layover_transit_mins: z.coerce.number().nullable().optional(),
});

const FlightLegSchema = z
  .object({
    segments: z.array(FlightSegmentSchema),
    total_duration_mins: z.coerce.number().optional(),
    total_for_two: z.coerce.number().nullable().optional(),
    total_for_two_inr: z.coerce.number().nullable().optional(),
    cabin_class: z.string().optional(),
    price_per_person: z.coerce.number().nullable().optional(),
    price_per_person_inr: z.coerce.number().nullable().optional(),
    currency: z.string().optional(),
  })
  .transform((leg) => {
    const perPerson =
      leg.price_per_person ??
      leg.price_per_person_inr ??
      (leg.total_for_two_inr != null
        ? leg.total_for_two_inr / 2
        : leg.total_for_two != null
          ? leg.total_for_two / 2
          : null);

    const derivedCurrency =
      leg.currency ??
      (leg.price_per_person_inr != null || leg.total_for_two_inr != null
        ? "INR"
        : undefined);

    return {
      ...leg,
      price_per_person: perPerson,
      currency: derivedCurrency,
    };
  })
  .nullable()
  .optional();

const HotelSchema = z
  .object({
    name: z.string(),
    stars: z.coerce.number().optional(),
    address: z.string().optional(),
    lat: z.coerce.number().optional().default(0),
    lon: z.coerce.number().optional().default(0),
    price_per_night: z.coerce.number().nullable().optional(),
    currency: z.string().optional(),
    loyalty_program: z.string().nullable().optional(),
    booking_notes: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

const PanelStateSchema = z
  .object({
    status: z.string().optional(),
    stage: z.string().nullable().optional(),
    expected_total_days: z.coerce.number().int().nullable().optional(),
    actual_days: z.coerce.number().int().nullable().optional(),
    completion_ratio: z.coerce.number().nullable().optional(),
    is_partial: z.boolean().optional(),
    source: z.string().optional(),
    message: z.string().nullable().optional(),
    updated_at: z.string().optional(),
  })
  .optional();

const EstimatedBudgetSchema = z
  .object({
    currency: z.string().optional().default("USD"),
    flights_total: z.coerce.number().nullable().optional(),
    flights_total_inr: z.coerce.number().nullable().optional(),
    accommodation_total: z.coerce.number().nullable().optional(),
    accommodation_total_inr: z.coerce.number().nullable().optional(),
    activities_total: z.coerce.number().nullable().optional(),
    activities_total_inr: z.coerce.number().nullable().optional(),
    food_per_day: z.coerce.number().nullable().optional(),
    food_extra_inr: z.coerce.number().nullable().optional(),
    local_transport_per_day: z.coerce.number().nullable().optional(),
    local_transport_inr: z.coerce.number().nullable().optional(),
    total_estimate: z.coerce.number().nullable().optional(),
    total_estimate_inr: z.coerce.number().nullable().optional(),
    total_estimate_with_savings_inr: z.coerce.number().nullable().optional(),
    // old compat
    accommodation_per_night: z.coerce.number().nullable().optional(),
  })
  .transform((budget) => {
    const inferredCurrency =
      budget.currency ||
      (budget.flights_total_inr != null ||
      budget.accommodation_total_inr != null ||
      budget.activities_total_inr != null ||
      budget.food_extra_inr != null ||
      budget.local_transport_inr != null ||
      budget.total_estimate_inr != null ||
      budget.total_estimate_with_savings_inr != null
        ? "INR"
        : "USD");

    const localTransportPerDay =
      budget.local_transport_per_day ?? budget.local_transport_inr ?? null;

    const totalEstimate =
      budget.total_estimate ??
      budget.total_estimate_inr ??
      budget.total_estimate_with_savings_inr ??
      null;

    return {
      ...budget,
      currency: inferredCurrency,
      flights_total: budget.flights_total ?? budget.flights_total_inr ?? null,
      accommodation_total:
        budget.accommodation_total ?? budget.accommodation_total_inr ?? null,
      activities_total:
        budget.activities_total ?? budget.activities_total_inr ?? null,
      food_per_day: budget.food_per_day ?? budget.food_extra_inr ?? null,
      local_transport_per_day: localTransportPerDay,
      total_estimate: totalEstimate,
    };
  });

export const ItineraryDataSchema = z.object({
  destination: z.string(),
  total_days: z.number().int(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  weather_summary: z.string().nullable().optional(),
  best_season: z.string().nullable().optional(),
  seasonal_warnings: z.array(z.string()).optional().default([]),
  flights: z
    .object({
      outbound: FlightLegSchema,
      return: FlightLegSchema,
    })
    .nullable()
    .optional(),
  hotel: HotelSchema,
  days: z.array(DaySchema),
  panel_state: PanelStateSchema,
  tips: z.array(z.string()).optional().default([]),
  estimated_budget: EstimatedBudgetSchema.optional(),
});

export const ItinerarySchema = z.object({
  id: z.number().int().positive(),
  chat_room_id: z.string().uuid(),
  itinerary_data: ItineraryDataSchema,
  generated_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type ItineraryData = z.infer<typeof ItineraryDataSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type FlightSegment = z.infer<typeof FlightSegmentSchema>;
export type HotelData = z.infer<typeof HotelSchema>;
