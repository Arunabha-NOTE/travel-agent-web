"use client";

import { useEffect, useRef } from "react";
import { Icons } from "@/components/icons/icon";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";

type MessageListProps = {
  messages: Message[];
  streamingContent?: string | null;
  className?: string;
};

export function MessageList({
  messages,
  streamingContent,
  className,
}: MessageListProps) {
  const { Sparkles, UserCircle2 } = Icons;
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages or streaming
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className={cn("flex flex-col space-y-6 px-4 py-6 md:px-6", className)}>
      {messages.map((message) => {
        const isUser = message.sender_role === "user";
        return (
          <div
            key={message.id}
            className={cn("flex gap-3 items-end", isUser && "flex-row-reverse")}
          >
            {/* Avatar */}
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1",
                isUser
                  ? "bg-primary/20 text-primary ring-primary/30"
                  : "bg-gradient-to-br from-primary/30 to-primary/10 text-primary ring-selection/60",
              )}
            >
              {isUser ? (
                <UserCircle2 className="h-4 w-4" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={cn(
                "max-w-[78%] rounded-2xl px-4 py-3 shadow-sm",
                isUser
                  ? "bg-primary/14 text-foreground rounded-br-sm"
                  : "bg-surface/40 text-foreground border border-selection/30 rounded-bl-sm",
              )}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </p>
              <p
                className={cn(
                  "mt-1.5 text-[10px] text-muted/60 select-none",
                  isUser ? "text-right" : "text-left",
                )}
              >
                {new Date(message.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        );
      })}

      {/* Streaming assistant message */}
      {streamingContent !== null && streamingContent !== undefined && (
        <div className="flex gap-3 items-end">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary ring-1 ring-selection/60">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="max-w-[78%] rounded-2xl rounded-bl-sm bg-surface/40 border border-selection/30 px-4 py-3 shadow-sm">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {streamingContent}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-primary/70">
              <span className="flex gap-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-bounce [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-bounce [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-bounce [animation-delay:300ms]" />
              </span>
              Generating...
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
