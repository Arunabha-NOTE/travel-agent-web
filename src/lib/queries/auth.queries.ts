"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { authService } from "@/lib/api/auth.service";
import { setAccessToken } from "@/lib/auth/session";

export function useLoginMutation() {
  return useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAccessToken(data.access_token);
    },
  });
}

export function useBackendHealthQuery() {
  return useQuery({
    queryKey: ["system", "health"],
    queryFn: authService.healthCheck,
    retry: 1,
  });
}
