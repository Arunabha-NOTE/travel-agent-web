import axios from "axios";

type ApiErrorPayload = {
  error?: string;
  message?: string;
  detail?: string;
};

export type ParsedApiError = {
  code?: string;
  message: string;
  status?: number;
};

export function parseApiError(
  error: unknown,
  fallback: string,
): ParsedApiError {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as ApiErrorPayload | undefined;

    return {
      code: payload?.error,
      message:
        (typeof payload?.message === "string" && payload.message.trim()) ||
        (typeof payload?.detail === "string" && payload.detail.trim()) ||
        error.message ||
        fallback,
      status: error.response?.status,
    };
  }

  if (error instanceof Error && error.message.trim()) {
    return { message: error.message };
  }

  return { message: fallback };
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  return parseApiError(error, fallback).message;
}
