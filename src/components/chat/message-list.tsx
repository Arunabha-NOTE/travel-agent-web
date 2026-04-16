"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Icons } from "@/components/icons/icon";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";

type MessageListProps = {
  messages: Message[];
  streamingContent?: string | null;
  className?: string;
};

const THINK_CLOSED_RE = /<think>([\s\S]*?)<\/think>/g;
const THINK_OPEN_RE = /<think>([\s\S]*)$/;
const ITINERARY_CLOSED_RE = /<itinerary>[\s\S]*?<\/itinerary>/;
const ITINERARY_OPEN_RE = /<itinerary>[\s\S]*$/;

/**
 * Parse message content:
 *  - Remove ALL <think>...</think> blocks, collecting them into thinkContent
 *  - Handle unclosed streaming think block
 *  - Strip <itinerary> blocks and replace with placeholder text
 */
function parseMessageContent(raw: string) {
  let text = raw ?? "";
  const thinkParts: string[] = [];
  let isThinking = false;

  // Remove ALL completed think blocks globally, collecting their content
  text = text.replace(THINK_CLOSED_RE, (_match: string, inner: string) => {
    thinkParts.push(inner.trim());
    return "";
  });
  // Reset lastIndex after global regex use
  THINK_CLOSED_RE.lastIndex = 0;

  // Check for an unclosed (still-streaming) think block at the end
  const openThink = THINK_OPEN_RE.exec(text);
  if (openThink) {
    thinkParts.push(openThink[1].trim());
    text = text.slice(0, openThink.index);
    isThinking = true;
  }

  const thinkContent =
    thinkParts.length > 0 ? thinkParts.join("\n\n---\n\n") : null;

  // Strip finished itinerary block and replace with placeholder
  const closedItinerary = ITINERARY_CLOSED_RE.exec(text);
  if (closedItinerary) {
    text = text
      .replace(
        closedItinerary[0],
        "\n\n\u2728 *I've generated your custom itinerary \u2014 see the card panel on the right!*",
      )
      .trim();
  } else {
    const openItinerary = ITINERARY_OPEN_RE.exec(text);
    if (openItinerary) {
      text = text
        .slice(0, openItinerary.index)
        .concat("\n\n\u2699\ufe0f *Saving itinerary details...*")
        .trim();
    }
  }

  return { content: text.trim(), thinkContent, isThinking };
}

/** Strip think tags — used for titles/placeholders in the UI */
export function stripThinkTags(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/g, "")
    .replace(/<think>[\s\S]*$/, "")
    .trim();
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p className="mb-2 last:mb-0 text-sm leading-relaxed">{children}</p>
        ),
        h1: ({ children }) => (
          <h1 className="text-base font-bold mt-3 mb-1">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-sm font-bold mt-3 mb-1">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        code: ({ children, className }) => {
          const isBlock = className?.startsWith("language-");
          return isBlock ? (
            <code className="block bg-black/30 rounded-lg p-3 text-xs font-mono overflow-x-auto my-2 whitespace-pre">
              {children}
            </code>
          ) : (
            <code className="bg-black/20 rounded px-1 py-0.5 text-xs font-mono">
              {children}
            </code>
          );
        },
        pre: ({ children }) => <>{children}</>,
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-0.5 text-sm my-1 pl-2">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-0.5 text-sm my-1 pl-2">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        table: ({ children }) => (
          <div className="overflow-x-auto my-2">
            <table className="text-xs border-collapse w-full">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-surface/50">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="border border-selection/40 px-2 py-1 text-left font-semibold">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-selection/40 px-2 py-1">{children}</td>
        ),
        hr: () => <hr className="my-3 border-selection/40" />,
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:opacity-80"
          >
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-primary/50 pl-3 italic text-foreground/70 my-2 text-sm">
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export function MessageList({
  messages,
  streamingContent,
  className,
}: MessageListProps) {
  const { ChevronDown, Sparkles, UserCircle2 } = Icons;
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  return (
    <div className={cn("flex flex-col space-y-6 px-4 py-6 md:px-6", className)}>
      {messages.map((message) => {
        const isUser = message.sender_role === "user";
        const { content, thinkContent } = parseMessageContent(message.content);

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
              {/* Thought process accordion (AI only) */}
              {!isUser && thinkContent && (
                <details className="mb-3 rounded-lg border border-selection/30 bg-surface/20 group">
                  <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-muted select-none hover:text-foreground flex items-center justify-between">
                    <span>Thought process</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-50 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-3 pb-3 pt-1 text-xs text-muted/80 whitespace-pre-wrap border-t border-selection/20">
                    {thinkContent}
                  </div>
                </details>
              )}

              {content &&
                (isUser ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {content}
                  </p>
                ) : (
                  <MarkdownContent content={content} />
                ))}

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
      {streamingContent !== null &&
        streamingContent !== undefined &&
        (() => {
          const { content, thinkContent, isThinking } =
            parseMessageContent(streamingContent);

          return (
            <div className="flex gap-3 items-end">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary ring-1 ring-selection/60">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="max-w-[78%] rounded-2xl rounded-bl-sm bg-surface/40 border border-selection/30 px-4 py-3 shadow-sm flex flex-col gap-2">
                {thinkContent && (
                  <details
                    open={isThinking}
                    className="rounded-lg border border-selection/30 bg-surface/20 group"
                  >
                    <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-muted select-none hover:text-foreground flex items-center justify-between">
                      <span>
                        {isThinking ? "Thinking..." : "Thought process"}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 opacity-50 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="px-3 pb-3 pt-1 text-xs text-muted/80 whitespace-pre-wrap border-t border-selection/20">
                      {thinkContent}
                    </div>
                  </details>
                )}

                {content && <MarkdownContent content={content} />}

                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-primary/70">
                  <span className="flex gap-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-bounce [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-bounce [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-bounce [animation-delay:300ms]" />
                  </span>
                  {isThinking ? "Thinking..." : "Generating..."}
                </div>
              </div>
            </div>
          );
        })()}

      <div ref={bottomRef} />
    </div>
  );
}
