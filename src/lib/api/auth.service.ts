import type {
  CreateChatRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LogoutRequest,
  ProfileResetPasswordRequest,
  RegisterRequest,
  RenameChatRequest,
} from "@/lib/api/auth.schemas";
import {
  ChatListSchema,
  ChatSchema,
  CreateChatRequestSchema,
  ForgotPasswordRequestSchema,
  ForgotPasswordResponseSchema,
  HealthResponseSchema,
  LoginRequestSchema,
  LoginResponseSchema,
  LogoutRequestSchema,
  ProfileResetPasswordRequestSchema,
  RegisterRequestSchema,
  RenameChatRequestSchema,
  UserProfileSchema,
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

  async register(payload: RegisterRequest) {
    const validatedPayload = RegisterRequestSchema.parse(payload);
    const response = await apiClient.post(
      "/api/v1/auth/register",
      validatedPayload,
    );
    return LoginResponseSchema.parse(response.data);
  },

  async healthCheck() {
    const response = await apiClient.get("/");
    return HealthResponseSchema.parse(response.data);
  },

  async logout(payload: LogoutRequest) {
    const validatedPayload = LogoutRequestSchema.parse(payload);
    const response = await apiClient.post(
      "/api/v1/auth/logout",
      validatedPayload,
    );
    return response.data as { message: string };
  },

  async forgotPassword(payload: ForgotPasswordRequest) {
    const validatedPayload = ForgotPasswordRequestSchema.parse(payload);
    const response = await apiClient.post(
      "/api/v1/auth/forgot-password",
      validatedPayload,
    );
    return ForgotPasswordResponseSchema.parse(response.data);
  },

  async getProfile() {
    const response = await apiClient.get("/api/v1/users/me");
    return UserProfileSchema.parse(response.data);
  },

  async resetPasswordFromProfile(payload: ProfileResetPasswordRequest) {
    const validatedPayload = ProfileResetPasswordRequestSchema.parse(payload);
    const response = await apiClient.post(
      "/api/v1/users/me/reset-password",
      validatedPayload,
    );
    return response.data as { message: string };
  },

  async listChats() {
    const response = await apiClient.get("/api/v1/chats/");
    return ChatListSchema.parse(response.data);
  },

  async getChat(chatId: number) {
    const response = await apiClient.get(`/api/v1/chats/${chatId}`);
    return ChatSchema.parse(response.data);
  },

  async createChat(payload: CreateChatRequest) {
    const validatedPayload = CreateChatRequestSchema.parse(payload);
    const response = await apiClient.post("/api/v1/chats/", validatedPayload);
    return ChatSchema.parse(response.data);
  },

  async renameChat(chatId: number, payload: RenameChatRequest) {
    const validatedPayload = RenameChatRequestSchema.parse(payload);
    const response = await apiClient.patch(
      `/api/v1/chats/${chatId}`,
      validatedPayload,
    );
    return ChatSchema.parse(response.data);
  },

  async deleteChat(chatId: number) {
    await apiClient.delete(`/api/v1/chats/${chatId}`);
  },
};
