"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  clearAuthSession,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/lib/auth/session";
import { queryKeys } from "@/lib/query/query-keys";
import { authService } from "@/lib/service";
import { parseApiError } from "@/lib/utils/api-error";

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.auth.register,
    mutationFn: authService.register,
    onSuccess: (data) => {
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.me });
      toast.success("Account created successfully");
    },
    onError: (error) => {
      toast.error(parseApiError(error, "Unable to create account").message);
    },
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.auth.login,
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.me });
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.list });
      toast.success("Signed in");
    },
    onError: (error) => {
      toast.error(parseApiError(error, "Unable to sign in").message);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.auth.logout,
    mutationFn: async () => {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await authService.logout({ refresh_token: refreshToken });
      }
      clearAuthSession();
      queryClient.clear();
    },
    onSuccess: () => {
      toast.success("Signed out");
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationKey: queryKeys.auth.forgotPassword,
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      toast.success("Reset instructions sent");
    },
    onError: (error) => {
      toast.error(
        parseApiError(error, "Unable to process password reset request")
          .message,
      );
    },
  });
}

export function useBackendHealthQuery() {
  return useQuery({
    queryKey: queryKeys.system.health,
    queryFn: authService.healthCheck,
    retry: 1,
  });
}

export function useProfileQuery() {
  return useQuery({
    queryKey: queryKeys.profile.me,
    queryFn: authService.getProfile,
  });
}

export function useProfileResetPasswordMutation() {
  return useMutation({
    mutationKey: queryKeys.profile.resetPassword,
    mutationFn: authService.resetPasswordFromProfile,
    onSuccess: () => {
      toast.success("Password updated");
    },
    onError: (error) => {
      toast.error(parseApiError(error, "Password reset failed").message);
    },
  });
}

export function useChatsQuery() {
  return useQuery({
    queryKey: queryKeys.chat.list,
    queryFn: authService.listChats,
  });
}

export function useChatQuery(chatId?: string) {
  return useQuery({
    queryKey: queryKeys.chat.detail(chatId),
    queryFn: () => authService.getChat(chatId as string),
    enabled: typeof chatId === "string" && chatId.length > 0,
  });
}

export function useCreateChatMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.chat.create,
    mutationFn: authService.createChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.list });
      toast.success("Chat created");
    },
    onError: (error) => {
      toast.error(parseApiError(error, "Unable to create chat").message);
    },
  });
}

export function useRenameChatMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.chat.rename,
    mutationFn: ({ chatId, title }: { chatId: string; title: string }) =>
      authService.renameChat(chatId, { title }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.list });
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.detail(data.id),
      });
      toast.success("Chat renamed");
    },
    onError: (error) => {
      toast.error(parseApiError(error, "Unable to rename chat").message);
    },
  });
}

export function useDeleteChatMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.chat.delete,
    mutationFn: authService.deleteChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.list });
      toast.success("Chat deleted");
    },
    onError: (error) => {
      toast.error(parseApiError(error, "Unable to delete chat").message);
    },
  });
}
