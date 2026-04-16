"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { clientEnv } from "@/config/env";
import { getAccessToken } from "@/lib/auth/session";
import { queryKeys } from "@/lib/query/query-keys";
import { chatService } from "@/lib/service";

/** Fetch all messages for a chat room. */
export function useMessagesQuery(chatId?: number) {
  return useQuery({
    queryKey: queryKeys.message.list(chatId),
    queryFn: () => chatService.listMessages(chatId as number),
    enabled: typeof chatId === "number" && Number.isFinite(chatId),
    staleTime: 0,
  });
}

/** Fetch the latest itinerary for a chat room. Silently returns null on 404. */
export function useItineraryQuery(chatId?: number) {
  return useQuery({
    queryKey: queryKeys.itinerary.detail(chatId),
    queryFn: () => chatService.getItinerary(chatId as number),
    enabled: typeof chatId === "number" && Number.isFinite(chatId),
    retry: (failureCount, error: unknown) => {
      // Don't retry on 404 (no itinerary yet)
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as { response?: { status?: number } }).response?.status === 404
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook for sending a chat message and streaming the response.
 *
 * Manages an optimistic "streaming" message that accumulates tokens,
 * then refreshes the message list and itinerary when complete.
 */
export function useSendMessage(chatId?: number) {
  const queryClient = useQueryClient();
  const [streamingContent, setStreamingContent] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string, agent: "langchain" | "langgraph" = "langchain") => {
      if (!chatId) return;

      const token = getAccessToken();
      if (!token) {
        toast.error("Not authenticated");
        return;
      }

      setIsStreaming(true);
      setStreamingContent("");

      try {
        abortRef.current = new AbortController();

        const response = await fetch(
          `${clientEnv.NEXT_PUBLIC_API_BASE_URL}/api/v1/chats/${chatId}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content, agent }),
            signal: abortRef.current.signal,
          },
        );

        if (!response.ok) {
          throw new Error(`Request failed: ${response.statusText}`);
        }

        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") break;
            if (data.startsWith("[ERROR]")) {
              toast.error(data.replace("[ERROR] ", ""));
              break;
            }
            // Unescape newlines encoded in SSE
            const token = data.replace(/\\n/g, "\n");
            accumulated += token;
            setStreamingContent(accumulated);
          }
        }
      } catch (error: unknown) {
        if (
          typeof error === "object" &&
          error !== null &&
          "name" in error &&
          (error as { name?: string }).name !== "AbortError"
        ) {
          toast.error("Failed to send message");
          console.error("Stream error:", error);
        }
      } finally {
        setIsStreaming(false);
        setStreamingContent(null);

        // Refresh messages and itinerary
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: queryKeys.message.list(chatId),
          }),
          queryClient.invalidateQueries({
            queryKey: queryKeys.itinerary.detail(chatId),
          }),
        ]);
      }
    },
    [chatId, queryClient],
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { sendMessage, streamingContent, isStreaming, abort };
}
