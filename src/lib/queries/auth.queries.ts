"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authService } from "@/lib/api/auth.service";
import {
  clearAuthSession,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/lib/auth/session";

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["auth", "register"],
    mutationFn: authService.register,
    onSuccess: (data) => {
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      queryClient.invalidateQueries({ queryKey: ["chat", "list"] });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["auth", "logout"],
    mutationFn: async () => {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await authService.logout({ refresh_token: refreshToken });
      }
      clearAuthSession();
      queryClient.clear();
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationKey: ["auth", "forgot-password"],
    mutationFn: authService.forgotPassword,
  });
}

export function useBackendHealthQuery() {
  return useQuery({
    queryKey: ["system", "health"],
    queryFn: authService.healthCheck,
    retry: 1,
  });
}

export function useProfileQuery() {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: authService.getProfile,
  });
}

export function useProfileResetPasswordMutation() {
  return useMutation({
    mutationKey: ["profile", "reset-password"],
    mutationFn: authService.resetPasswordFromProfile,
  });
}

export function useChatsQuery() {
  return useQuery({
    queryKey: ["chat", "list"],
    queryFn: authService.listChats,
  });
}

export function useChatQuery(chatId?: number) {
  return useQuery({
    queryKey: ["chat", "detail", chatId],
    queryFn: () => authService.getChat(chatId as number),
    enabled: typeof chatId === "number" && Number.isFinite(chatId),
  });
}

export function useCreateChatMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["chat", "create"],
    mutationFn: authService.createChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "list"] });
    },
  });
}

export function useRenameChatMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["chat", "rename"],
    mutationFn: ({ chatId, title }: { chatId: number; title: string }) =>
      authService.renameChat(chatId, { title }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chat", "list"] });
      queryClient.invalidateQueries({ queryKey: ["chat", "detail", data.id] });
    },
  });
}

export function useDeleteChatMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["chat", "delete"],
    mutationFn: authService.deleteChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "list"] });
    },
  });
}
