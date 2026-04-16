"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ItineraryCard } from "@/components/chat/itinerary-card";
import { MessageInput } from "@/components/chat/message-input";
import { MessageList, stripThinkTags } from "@/components/chat/message-list";
import { Icons } from "@/components/icons/icon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useChatQuery,
  useChatsQuery,
  useCreateChatMutation,
  useDeleteChatMutation,
  useItineraryQuery,
  useLogoutMutation,
  useMessagesQuery,
  useProfileQuery,
  useRenameChatMutation,
  useSendMessage,
} from "@/lib/query";
import { cn } from "@/lib/utils";

type ChatWorkspaceProps = {
  selectedChatId?: string;
};

export function ChatWorkspace({ selectedChatId }: ChatWorkspaceProps) {
  const {
    Loader2,
    LogOut,
    MessageSquare,
    PencilLine,
    PlaneTakeoff,
    Plus,
    Search,
    Trash2,
    UserCircle2,
  } = Icons;

  const router = useRouter();
  const chatsQuery = useChatsQuery();
  const profileQuery = useProfileQuery();
  const createChatMutation = useCreateChatMutation();
  const renameChatMutation = useRenameChatMutation();
  const deleteChatMutation = useDeleteChatMutation();
  const logoutMutation = useLogoutMutation();

  const [searchValue, setSearchValue] = useState("");
  const [renameChatId, setRenameChatId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [deleteChatId, setDeleteChatId] = useState<string | null>(null);
  const [isItineraryFullscreen, setIsItineraryFullscreen] = useState(false);

  const chats = chatsQuery.data ?? [];
  const profile = profileQuery.data;

  const filteredChats = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) {
      return chats;
    }

    return chats.filter((chat) => chat.title.toLowerCase().includes(query));
  }, [chats, searchValue]);

  const activeChatId = useMemo(() => {
    if (typeof selectedChatId === "string") {
      return selectedChatId;
    }

    return chats[0]?.id;
  }, [chats, selectedChatId]);

  const chatQuery = useChatQuery(activeChatId);
  const activeChat = chatQuery.data;

  const messagesQuery = useMessagesQuery(activeChatId);
  const itineraryQuery = useItineraryQuery(activeChatId);
  const { sendMessage, streamingContent, isStreaming } =
    useSendMessage(activeChatId);

  const messages = messagesQuery.data ?? [];

  const deleteChatTarget = chats.find((chat) => chat.id === deleteChatId);

  async function onCreateChat() {
    const created = await createChatMutation.mutateAsync({ title: "New chat" });
    router.push(`/chat/${created.id}`);
  }

  async function onRenameSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (renameChatId === null) {
      return;
    }

    const title = renameTitle.trim();
    if (!title) {
      return;
    }

    await renameChatMutation.mutateAsync({
      chatId: renameChatId,
      title,
    });

    setRenameChatId(null);
    setRenameTitle("");
  }

  async function onConfirmDelete() {
    if (deleteChatId === null) {
      return;
    }

    const wasActive = deleteChatId === activeChatId;
    await deleteChatMutation.mutateAsync(deleteChatId);
    setDeleteChatId(null);

    if (wasActive) {
      router.push("/chat");
    }
  }

  async function onLogout() {
    await logoutMutation.mutateAsync();
    router.push("/login");
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
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

          {activeChat && (
            <div className="hidden items-center gap-2 rounded-full border border-selection/60 bg-surface/20 px-3 py-1.5 text-xs text-foreground/80 md:flex">
              <MessageSquare className="h-3.5 w-3.5" />
              {stripThinkTags(activeChat.title)}
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

      <div className="min-h-0 flex-1 overflow-hidden px-4 py-4 md:px-6 md:py-6">
        <div className="flex h-full min-h-0 gap-4">
          {/* Main Sidebar */}
          <aside className="surface-panel hidden w-[280px] shrink-0 lg:flex h-full min-h-0 flex-col overflow-hidden rounded-[1.75rem]">
            <div className="border-b border-selection/70 p-4">
              <Button
                type="button"
                className="w-full justify-center gap-2"
                disabled={createChatMutation.isPending}
                onClick={() => void onCreateChat()}
              >
                {createChatMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                New chat
              </Button>
            </div>

            <div className="space-y-3 border-b border-selection/70 px-4 py-4">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search chats..."
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex flex-1 flex-col overflow-hidden px-4 py-4">
              <div className="mb-3">
                <p className="text-xs font-medium text-muted">Recent chats</p>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto">
                {chatsQuery.isLoading ? (
                  <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading chats...
                  </div>
                ) : null}

                {chatsQuery.isError ? (
                  <div className="rounded-lg border border-red/30 bg-red/10 px-3 py-2 text-sm text-red">
                    Failed to load chats.
                  </div>
                ) : null}

                {!chatsQuery.isLoading && filteredChats.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted">
                    {searchValue
                      ? "No chats match that search."
                      : "No chats yet. Create your first one."}
                  </div>
                ) : null}

                {filteredChats.map((chat) => {
                  const isActive = chat.id === activeChatId;

                  return (
                    <div
                      key={chat.id}
                      className={cn(
                        "group relative rounded-lg border px-3 py-2 transition-colors",
                        isActive
                          ? "border-primary/45 bg-primary/12"
                          : "border-selection/40 bg-surface/10 hover:bg-surface/30",
                      )}
                    >
                      <Link href={`/chat/${chat.id}`} className="block">
                        <p className="truncate text-sm font-medium text-foreground">
                          {stripThinkTags(chat.title)}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {new Date(chat.updated_at).toLocaleDateString()}
                        </p>
                      </Link>

                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 rounded-md p-0"
                          onClick={() => {
                            setRenameChatId(chat.id);
                            setRenameTitle(chat.title);
                          }}
                        >
                          <PencilLine className="h-3.5 w-3.5" />
                          <span className="sr-only">Rename chat</span>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 rounded-md p-0 text-red hover:bg-red/10 hover:text-red"
                          onClick={() => setDeleteChatId(chat.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Delete chat</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-selection/70 p-4">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg border border-selection/60 bg-surface/20 px-3 py-2 text-left transition-colors hover:bg-surface/30"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {profile?.email ?? "Loading..."}
                      </p>
                    </div>
                    <UserCircle2 className="h-4 w-4 text-muted" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-64">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {profile?.username ?? "Traveler"}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {profile?.email ?? "Loading..."}
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <Button
                        asChild
                        variant="outline"
                        className="justify-start gap-2"
                      >
                        <Link href="/profile">
                          <UserCircle2 className="h-4 w-4" />
                          Open profile
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start gap-2"
                        disabled={logoutMutation.isPending}
                        onClick={() => void onLogout()}
                      >
                        <LogOut className="h-4 w-4" />
                        {logoutMutation.isPending ? "Signing out..." : "Logout"}
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </aside>

          <section className="surface-panel flex flex-1 h-full min-h-0 flex-col overflow-hidden rounded-[1.75rem]">
            <div className="flex h-full flex-col">
              {chatQuery.isLoading ? (
                <div className="flex flex-1 items-center justify-center px-6">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading chat...
                  </div>
                </div>
              ) : null}

              {chatQuery.isError ? (
                <div className="flex flex-1 items-center justify-center px-6">
                  <div className="rounded-lg border border-red/30 bg-red/10 px-4 py-3 text-sm text-red">
                    Unable to load this chat.
                  </div>
                </div>
              ) : null}

              {!chatQuery.isLoading && !chatQuery.isError && !activeChat ? (
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

              {!chatQuery.isLoading && !chatQuery.isError && activeChat ? (
                <>
                  <div className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-3xl">
                      {messagesQuery.isLoading ? (
                        <div className="flex justify-center p-8 text-sm text-muted">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading messages...
                        </div>
                      ) : (
                        <MessageList
                          messages={messages}
                          streamingContent={streamingContent}
                        />
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 border-t border-selection/50 px-4 py-4 md:px-6 mt-auto">
                    <div className="mx-auto max-w-3xl">
                      <MessageInput
                        onSend={sendMessage}
                        disabled={isStreaming}
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
                  : "hidden lg:flex w-[380px] h-full rounded-[1.75rem]"
              )}
            >
              <ItineraryCard
                chatId={activeChatId}
                isFullscreen={isItineraryFullscreen}
                onToggleFullscreen={() => setIsItineraryFullscreen((prev) => !prev)}
              />
            </aside>
          )}
        </div>
      </div>

      <Dialog
        open={renameChatId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRenameChatId(null);
            setRenameTitle("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename chat</DialogTitle>
          </DialogHeader>

          <form className="mt-5" onSubmit={onRenameSubmit}>
            <Input
              value={renameTitle}
              onChange={(event) => setRenameTitle(event.target.value)}
              placeholder="Thread title"
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRenameChatId(null);
                  setRenameTitle("");
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={renameChatMutation.isPending}>
                {renameChatMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteChatId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteChatId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete chat?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteChatTarget
                ? `This will permanently remove "${deleteChatTarget.title}" from your history.`
                : "This thread will be permanently removed from your history."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                className="bg-red text-white hover:bg-red/90"
                disabled={deleteChatMutation.isPending}
                onClick={() => void onConfirmDelete()}
              >
                {deleteChatMutation.isPending ? "Deleting..." : "Delete chat"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
