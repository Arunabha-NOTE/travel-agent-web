"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { stripThinkTags } from "@/components/chat/message-list";
import { Icons } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { useChatQuery, useCreateChatMutation } from "@/lib/query";

export function AppHeader() {
  const { PlaneTakeoff, MessageSquare, Plus, Loader2 } = Icons;
  const router = useRouter();
  const params = useParams();
  const chatId = params.chatId as string | undefined;

  const { data: chat } = useChatQuery(chatId);
  const createChatMutation = useCreateChatMutation();

  async function onCreateChat() {
    const created = await createChatMutation.mutateAsync({ title: "New chat" });
    router.push(`/chat/${created.id}`);
  }

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-selection/60 bg-background-dark/80 backdrop-blur-xl">
      <div className="flex w-full items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <PlaneTakeoff aria-hidden="true" className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">
            TravelAI
          </span>
        </Link>

        {chat && (
          <div className="hidden items-center gap-2 rounded-full border border-selection/60 bg-surface/20 px-3 py-1.5 text-xs text-foreground/80 md:flex">
            <MessageSquare className="h-3.5 w-3.5" />
            {stripThinkTags(chat.title)}
          </div>
        )}

        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5 rounded-full text-xs"
          disabled={createChatMutation.isPending}
          onClick={() => void onCreateChat()}
        >
          {createChatMutation.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          New chat
        </Button>
      </div>
    </header>
  );
}
