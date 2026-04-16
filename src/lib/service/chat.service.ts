/**
 * Chat service — messages and itinerary API calls.
 * Follows the same patterns as authService in auth.service.ts.
 */

import { clientEnv } from "@/config/env";
import { apiClient } from "@/lib/client";
import {
  ItinerarySchema,
  MessageListSchema,
  SendMessageRequestSchema,
} from "@/lib/schemas";
import type { Itinerary, Message, SendMessageRequest } from "@/lib/types";

export const chatService = {
  /** List all messages in a chat room (ordered oldest-first). */
  async listMessages(chatId: string): Promise<Message[]> {
    const response = await apiClient.get(`/api/v1/chats/${chatId}/messages`);
    return MessageListSchema.parse(response.data);
  },

  /**
   * Send a user message and receive a streaming SSE response.
   *
   * Returns a native EventSource-compatible ReadableStream reader.
   * Pass the auth token manually because EventSource doesn't support headers natively.
   */
  async sendMessageStream(
    chatId: string,
    payload: SendMessageRequest,
    authToken: string,
  ): Promise<ReadableStreamDefaultReader<Uint8Array>> {
    const validated = SendMessageRequestSchema.parse(payload);

    const response = await fetch(
      `${clientEnv.NEXT_PUBLIC_API_BASE_URL}/api/v1/chats/${chatId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(validated),
      },
    );

    if (!response.ok) {
      throw new Error(`Send message failed: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error("No response body from server");
    }

    return response.body.getReader();
  },

  /** Get the latest generated itinerary for a chat room. */
  async getItinerary(chatId: string): Promise<Itinerary> {
    const response = await apiClient.get(`/api/v1/chats/${chatId}/itinerary`);
    return ItinerarySchema.parse(response.data);
  },
};
