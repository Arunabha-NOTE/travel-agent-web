"use client";

import { useEffect, useRef, useState } from "react";
import { Icons } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AgentMode = "langchain" | "langgraph";

type MessageInputProps = {
  onSend: (content: string, agent: AgentMode) => void;
  disabled?: boolean;
  placeholder?: string;
};

// biome-ignore lint/complexity/useRegexLiterals: necessary to bypass control character warnings
const CONTROL_CHAR_RE = new RegExp(
  "[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F-\\x9F]",
  "u",
);
const KNOWN_PROBLEMATIC_CHAR_RE = /\uA9C5/u;

function validateMessageContent(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Message cannot be empty.";
  if (trimmed.length > 8192)
    return "Message is too long (max 8192 characters).";
  if (CONTROL_CHAR_RE.test(trimmed)) {
    return "Message contains unsupported control characters.";
  }
  if (KNOWN_PROBLEMATIC_CHAR_RE.test(trimmed)) {
    return "Message contains an unsupported character.";
  }
  return null;
}

export function MessageInput({
  onSend,
  disabled,
  placeholder,
}: MessageInputProps) {
  const { Send, Loader2, Cpu, GitBranch } = Icons;
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [agent, setAgent] = useState<AgentMode>("langchain");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasLiveValidationError =
    value.trim().length > 0 && validateMessageContent(value) !== null;

  // Auto-resize textarea
  // biome-ignore lint/correctness/useExhaustiveDependencies: necessary to trigger resize on value change
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = value.trim();
    if (disabled) return;

    const validationError = validateMessageContent(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onSend(trimmed, agent);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {/* Agent toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted font-medium">Agent:</span>
        <div className="flex overflow-hidden rounded-full border border-selection/50 bg-surface/20 p-0.5 gap-0.5">
          <button
            type="button"
            onClick={() => setAgent("langchain")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all",
              agent === "langchain"
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:text-foreground",
            )}
          >
            <Cpu className="h-3 w-3" />
            LangChain
          </button>
          <button
            type="button"
            onClick={() => setAgent("langgraph")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all",
              agent === "langgraph"
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:text-foreground",
            )}
          >
            <GitBranch className="h-3 w-3" />
            LangGraph
          </button>
        </div>
      </div>

      {/* Input area */}
      <div className="flex items-end gap-3 rounded-2xl border border-selection/60 bg-surface/20 p-3">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            const nextValue = e.target.value;
            setValue(nextValue);
            const nextError =
              nextValue.trim().length > 0
                ? validateMessageContent(nextValue)
                : null;
            setError(nextError);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? "Plan my trip to..."}
          rows={1}
          disabled={disabled}
          className="min-h-[40px] flex-1 resize-none border-0 bg-transparent px-0 py-2 text-sm text-foreground shadow-none outline-none placeholder:text-muted disabled:opacity-50"
        />
        <Button
          type="submit"
          size="sm"
          disabled={disabled || !value.trim() || hasLiveValidationError}
          className="h-9 shrink-0 rounded-xl px-4"
        >
          {disabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      {error ? <p className="text-xs text-red">{error}</p> : null}
      <p className="text-center text-[11px] text-muted">
        Press{" "}
        <kbd className="rounded bg-surface/40 px-1 py-0.5 font-mono text-[10px]">
          Enter
        </kbd>{" "}
        to send ·{" "}
        <kbd className="rounded bg-surface/40 px-1 py-0.5 font-mono text-[10px]">
          Shift+Enter
        </kbd>{" "}
        for new line
      </p>
    </form>
  );
}
