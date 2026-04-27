"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { clientEnv } from "@/config/env";
import { queryKeys } from "@/lib/query/query-keys";
import { authService, chatService } from "@/lib/service";
import type { Chat, Message } from "@/lib/types";

const DEFAULT_CHAT_TITLES = new Set(["new chat", "", "new conversation"]);

function needsGeneratedTitle(chat?: Pick<Chat, "title"> | null) {
  const normalized = chat?.title?.trim().toLowerCase() ?? "";
  return DEFAULT_CHAT_TITLES.has(normalized);
}

/** Fetch all messages for a chat room. */
export function useMessagesQuery(chatId?: string) {
  return useQuery({
    queryKey: queryKeys.message.list(chatId),
    queryFn: () => chatService.listMessages(chatId as string),
    enabled: typeof chatId === "string" && chatId.length > 0,
    staleTime: 0,
  });
}

/** Fetch the latest itinerary for a chat room. Silently returns null on 404. */
export function useItineraryQuery(chatId?: string, liveUpdates = false) {
  return useQuery({
    queryKey: queryKeys.itinerary.detail(chatId),
    queryFn: async () => {
      console.debug("[useItineraryQuery] fetching", { chatId, liveUpdates });
      const data = await chatService.getItinerary(chatId as string);
      if (!data) {
        console.debug("[useItineraryQuery] empty itinerary", { chatId });
        return null;
      }

      const days = Array.isArray(data.itinerary_data?.days)
        ? data.itinerary_data.days.length
        : 0;
      console.debug("[useItineraryQuery] fetched", { chatId, days });
      return data;
    },
    enabled: typeof chatId === "string" && chatId.length > 0,
    staleTime: 0,
    // Reduce polling frequency and handle 404s gracefully in queryFn to avoid console spam
    refetchInterval: liveUpdates ? 6000 : false,
    refetchIntervalInBackground: false,
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
      return failureCount < 1;
    },
  });
}

/**
 * Hook for sending a chat message and streaming the response.
 *
 * Manages an optimistic "streaming" message that accumulates tokens,
 * then refreshes the message list and itinerary when complete.
 */
export function useSendMessage(chatId?: string) {
  const queryClient = useQueryClient();
  const [streamingContent, setStreamingContent] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const streamingIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const sendMessage = useCallback(
    async (content: string, agent: "langchain" | "langgraph" = "langchain") => {
      if (!chatId) return;

      // Optimistically add user message to the UI
      queryClient.setQueryData(
        queryKeys.message.list(chatId),
        (old: Message[] | undefined) => {
          const tempMsg = {
            id: crypto.randomUUID(), // Temporary ID
            chat_room_id: chatId,
            sender_role: "user",
            content,
            created_at: new Date().toISOString(),
          };
          return old ? [...old, tempMsg] : [tempMsg];
        },
      );

      setIsPending(true);
      setIsStreaming(true);
      setStreamingContent("");

      try {
        abortRef.current = new AbortController();

        const response = await fetch(
          `${clientEnv.NEXT_PUBLIC_API_BASE_URL}/api/v1/chats/${chatId}/messages`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
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
        let sseBuffer = "";
        let streamTerminated = false;

        while (!streamTerminated) {
          const { done, value } = await reader.read();
          if (done) break;

          sseBuffer += decoder.decode(value, { stream: true });
          const lines = sseBuffer.split("\n");
          sseBuffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") {
              streamTerminated = true;
              break;
            }
            if (data.startsWith("[ERROR]")) {
              toast.error(data.replace("[ERROR] ", ""));
              streamTerminated = true;
              break;
            }
            // Unescape newlines encoded in SSE
            const token = data.replace(/\\n/g, "\n");
            accumulated += token;
            setIsStreaming(true);
            setStreamingContent(accumulated);
            if (streamingIdleTimerRef.current) {
              clearTimeout(streamingIdleTimerRef.current);
            }
            streamingIdleTimerRef.current = setTimeout(() => {
              // Only clear if we are not still decoding (e.g. slow network)
              setIsStreaming(false);
            }, 3500); // Increased buffer for slow tool usage/thought blocks
          }
        }

        if (!streamTerminated && sseBuffer.startsWith("data: ")) {
          const data = sseBuffer.slice(6);
          if (!data.startsWith("[ERROR]") && data !== "[DONE]") {
            const token = data.replace(/\\n/g, "\n");
            accumulated += token;
            setIsStreaming(true);
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
        if (streamingIdleTimerRef.current) {
          clearTimeout(streamingIdleTimerRef.current);
          streamingIdleTimerRef.current = null;
        }
        // Refresh messages and itinerary
        // CRITICAL: We await the messages invalidation so the stable list is updated
        // BEFORE we clear the streaming state, preventing the "flicker" gap.
        const refreshPromise = Promise.all([
          queryClient.invalidateQueries({
            queryKey: queryKeys.message.list(chatId),
          }),
          queryClient.invalidateQueries({
            queryKey: queryKeys.itinerary.detail(chatId),
          }),
          queryClient.invalidateQueries({
            queryKey: queryKeys.chat.list,
          }),
          queryClient.invalidateQueries({
            queryKey: queryKeys.chat.detail(chatId),
          }),
        ]);

        await refreshPromise;

        setIsPending(false);
        setIsStreaming(false);
        setStreamingContent(null);

        // Auto-title runs in background on the backend; recheck once more shortly after.
        setTimeout(() => {
          void queryClient.invalidateQueries({ queryKey: queryKeys.chat.list });
          void queryClient.invalidateQueries({
            queryKey: queryKeys.chat.detail(chatId),
          });
        }, 2000);

        const retryTitleRefresh = async () => {
          for (let attempt = 0; attempt < 5; attempt += 1) {
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const refreshedChat = await queryClient.fetchQuery({
              queryKey: queryKeys.chat.detail(chatId),
              queryFn: () => authService.getChat(chatId),
            });
            const refreshedChats = await queryClient.fetchQuery({
              queryKey: queryKeys.chat.list,
              queryFn: authService.listChats,
            });

            if (
              !needsGeneratedTitle(refreshedChat) ||
              refreshedChats.some(
                (chat) => chat.id === chatId && !needsGeneratedTitle(chat),
              )
            ) {
              return;
            }
          }
        };

        void retryTitleRefresh();
      }
    },
    [chatId, queryClient],
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { sendMessage, streamingContent, isStreaming, isPending, abort };
}

/** Toggle public share status for a chat. */
export function useShareChat() {
  const queryClient = useQueryClient();

  return {
    shareChat: async (chatId: string, isPublic: boolean) => {
      try {
        const result = await chatService.shareChat(chatId, isPublic);
        await queryClient.invalidateQueries({
          queryKey: queryKeys.chat.detail(chatId),
        });
        toast.success(
          result ? "Itinerary shared successfully" : "Itinerary unshared",
        );
        return result;
      } catch (error) {
        toast.error("Failed to update share status");
        throw error;
      }
    },
  };
}

/** Publicly accessible itinerary query (no auth required by backend). */
export function usePublicItineraryQuery(chatId?: string) {
  return useQuery({
    queryKey: ["itinerary", "public", chatId],
    queryFn: () => chatService.getPublicItinerary(chatId as string),
    enabled: typeof chatId === "string" && chatId.length > 0,
    staleTime: 5 * 60 * 1000, // 5 mins
  });
}
