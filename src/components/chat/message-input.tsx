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

export function MessageInput({
  onSend,
  disabled,
  placeholder,
}: MessageInputProps) {
  const { Send, Loader2, Cpu, GitBranch } = Icons;
  const [value, setValue] = useState("");
  const [agent, setAgent] = useState<AgentMode>("langchain");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, []);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
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
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? "Plan my trip to..."}
          rows={1}
          disabled={disabled}
          className="min-h-[40px] flex-1 resize-none border-0 bg-transparent px-0 py-2 text-sm text-foreground shadow-none outline-none placeholder:text-muted disabled:opacity-50"
        />
        <Button
          type="submit"
          size="sm"
          disabled={disabled || !value.trim()}
          className="h-9 shrink-0 rounded-xl px-4"
        >
          {disabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
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
