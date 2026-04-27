"use client";

import { useMemo, useState } from "react";
import { ItineraryCard } from "@/components/chat/itinerary-card";
import { MessageInput } from "@/components/chat/message-input";
import { MessageList, stripThinkTags } from "@/components/chat/message-list";
import { Icons } from "@/components/icons/icon";
import {
  useChatQuery,
  useChatsQuery,
  useMessagesQuery,
  useSendMessage,
} from "@/lib/query";
import { cn } from "@/lib/utils";

type ChatWorkspaceProps = {
  selectedChatId?: string;
};

export function ChatWorkspace({ selectedChatId }: ChatWorkspaceProps) {
  const { Loader2 } = Icons;

  const chatsQuery = useChatsQuery();
  const chats = chatsQuery.data ?? [];

  const [isItineraryFullscreen, setIsItineraryFullscreen] = useState(false);

  const activeChatId = useMemo(() => {
    if (typeof selectedChatId === "string") {
      return selectedChatId;
    }
    return chats[0]?.id;
  }, [chats, selectedChatId]);

  const {
    data: activeChat,
    isLoading: isChatLoading,
    isError: isChatError,
  } = useChatQuery(activeChatId);
  const { data: messages = [], isLoading: isMessagesLoading } =
    useMessagesQuery(activeChatId);
  const { sendMessage, streamingContent, isStreaming, isPending } =
    useSendMessage(activeChatId);

  return (
    <div className="flex h-full min-h-0 gap-4">
      <section className="surface-panel flex flex-1 h-full min-h-0 flex-col overflow-hidden rounded-[1.75rem]">
        <div className="flex h-full flex-col">
          {isChatLoading ? (
            <div className="flex flex-1 items-center justify-center px-6">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading chat...
              </div>
            </div>
          ) : null}

          {isChatError ? (
            <div className="flex flex-1 items-center justify-center px-6">
              <div className="rounded-lg border border-red/30 bg-red/10 px-4 py-3 text-sm text-red">
                Unable to load this chat.
              </div>
            </div>
          ) : null}

          {!isChatLoading && !isChatError && !activeChat ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
              <div className="w-full max-w-2xl text-center">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  What can I help with?
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
                  Start a fresh thread from the sidebar or reopen a past
                  planning session to continue refining your itinerary.
                </p>
              </div>
            </div>
          ) : null}

          {!isChatLoading && !isChatError && activeChat ? (
            <>
              <div className="flex-1 overflow-y-auto">
                <div className="w-full h-full">
                  {isMessagesLoading ? (
                    <div className="flex h-full items-center justify-center p-8 text-sm text-muted">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading messages...
                    </div>
                  ) : (
                    <MessageList
                      messages={messages}
                      streamingContent={streamingContent}
                      showStreamingStatus={isStreaming}
                      onSuggestionClick={(query) => sendMessage(query)}
                    />
                  )}
                </div>
              </div>

              <div className="shrink-0 border-t border-selection/50 px-4 py-4 md:px-6 mt-auto">
                <div className="w-full">
                  <MessageInput
                    onSend={sendMessage}
                    disabled={isPending}
                    placeholder={`Message ${stripThinkTags(activeChat.title)}...`}
                  />
                </div>
              </div>
            </>
          ) : null}
        </div>
      </section>

      {/* Itinerary / Planning Panel — always visible for active chats */}
      {activeChatId && (
        <aside
          className={cn(
            "surface-panel shrink-0 min-h-0 flex-col overflow-hidden transition-all duration-300",
            isItineraryFullscreen
              ? "absolute inset-4 z-50 flex rounded-3xl lg:relative lg:inset-auto lg:w-full lg:h-full lg:flex-1"
              : "hidden lg:flex w-[380px] h-full rounded-[1.75rem]",
          )}
        >
          <ItineraryCard
            chatId={activeChatId}
            liveUpdates={isPending}
            isFullscreen={isItineraryFullscreen}
            onToggleFullscreen={() => setIsItineraryFullscreen((prev) => !prev)}
          />
        </aside>
      )}
    </div>
  );
}
