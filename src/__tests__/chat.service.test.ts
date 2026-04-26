import { apiClient } from "@/lib/client";
import { chatService } from "@/lib/service/chat.service";

jest.mock("../lib/client", () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

describe("chatService", () => {
  describe("listMessages", () => {
    it("should fetch and parse messages", async () => {
      const mockMessages = [
        {
          id: 1,
          chat_room_id: "550e8400-e29b-41d4-a716-446655440000",
          sender_role: "user",
          content: "Hello",
          created_at: new Date().toISOString(),
        },
      ];
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockMessages });

      const result = await chatService.listMessages("chat-id");
      expect(result).toHaveLength(1);
      expect(result[0].content).toBe("Hello");
    });
  });

  describe("getItinerary", () => {
    it("should return null on 404", async () => {
      (apiClient.get as jest.Mock).mockRejectedValue({
        response: { status: 404 },
      });

      const result = await chatService.getItinerary("chat-id");
      expect(result).toBeNull();
    });

    it("should throw on other errors", async () => {
      (apiClient.get as jest.Mock).mockRejectedValue(
        new Error("Network error"),
      );

      await expect(chatService.getItinerary("chat-id")).rejects.toThrow(
        "Network error",
      );
    });
  });
});
