import type { LoginRequest } from "@/lib/api/auth.schemas";
import {
  HealthResponseSchema,
  LoginRequestSchema,
  LoginResponseSchema,
} from "@/lib/api/auth.schemas";
import { apiClient } from "@/lib/api/client";

export const authService = {
  async login(payload: LoginRequest) {
    const validatedPayload = LoginRequestSchema.parse(payload);
    const response = await apiClient.post(
      "/api/v1/auth/login",
      validatedPayload,
    );
    return LoginResponseSchema.parse(response.data);
  },

  async healthCheck() {
    const response = await apiClient.get("/");
    return HealthResponseSchema.parse(response.data);
  },
};
