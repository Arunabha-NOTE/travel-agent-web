import {
  loginAction,
  logoutAction,
  registerAction,
} from "@/app/actions/auth.actions";
import { apiClient } from "@/lib/client";
import {
  ChatListSchema,
  ChatSchema,
  CreateChatRequestSchema,
  ForgotPasswordRequestSchema,
  ForgotPasswordResponseSchema,
  HealthResponseSchema,
  LoginRequestSchema,
  LoginResponseSchema,
  ProfileResetPasswordRequestSchema,
  RegisterRequestSchema,
  RenameChatRequestSchema,
  UserProfileSchema,
} from "@/lib/schemas";
import type {
  CreateChatRequest,
  ForgotPasswordRequest,
  LoginRequest,
  ProfileResetPasswordRequest,
  RegisterRequest,
  RenameChatRequest,
} from "@/lib/types";

export const authService = {
  async login(payload: LoginRequest) {
    const validatedPayload = LoginRequestSchema.parse(payload);
    const data = await loginAction(validatedPayload);
    return LoginResponseSchema.parse(data);
  },

  async register(payload: RegisterRequest) {
    const validatedPayload = RegisterRequestSchema.parse(payload);
    const data = await registerAction(validatedPayload);
    return LoginResponseSchema.parse(data);
  },

  async healthCheck() {
    const response = await apiClient.get("/api/v1/health");
    return HealthResponseSchema.parse(response.data);
  },

  async logout() {
    await logoutAction();
    return { message: "Logged out" };
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

  async getChat(chatId: string) {
    const response = await apiClient.get(`/api/v1/chats/${chatId}`);
    return ChatSchema.parse(response.data);
  },

  async createChat(payload: CreateChatRequest) {
    const validatedPayload = CreateChatRequestSchema.parse(payload);
    const response = await apiClient.post("/api/v1/chats/", validatedPayload);
    return ChatSchema.parse(response.data);
  },

  async renameChat(chatId: string, payload: RenameChatRequest) {
    const validatedPayload = RenameChatRequestSchema.parse(payload);
    const response = await apiClient.patch(
      `/api/v1/chats/${chatId}`,
      validatedPayload,
    );
    return ChatSchema.parse(response.data);
  },

  async deleteChat(chatId: string) {
    await apiClient.delete(`/api/v1/chats/${chatId}`);
  },
};
