"use client";

import {
  Loader2,
  LogOut,
  MessageSquare,
  PencilLine,
  PlaneTakeoff,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UserCircle2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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
  DialogDescription,
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
  useLogoutMutation,
  useProfileQuery,
  useRenameChatMutation,
} from "@/lib/queries/auth.queries";
import { cn } from "@/lib/utils";

type ChatWorkspaceProps = {
  selectedChatId?: number;
};

export function ChatWorkspace({ selectedChatId }: ChatWorkspaceProps) {
  const router = useRouter();
  const chatsQuery = useChatsQuery();
  const profileQuery = useProfileQuery();
  const createChatMutation = useCreateChatMutation();
  const renameChatMutation = useRenameChatMutation();
  const deleteChatMutation = useDeleteChatMutation();
  const logoutMutation = useLogoutMutation();

  const [searchValue, setSearchValue] = useState("");
  const [renameChatId, setRenameChatId] = useState<number | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [deleteChatId, setDeleteChatId] = useState<number | null>(null);

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
    if (typeof selectedChatId === "number") {
      return selectedChatId;
    }

    return chats[0]?.id;
  }, [chats, selectedChatId]);

  const chatQuery = useChatQuery(activeChatId);
  const activeChat = chatQuery.data;

  const previewMessages = useMemo(() => {
    if (!activeChat) {
      return [];
    }

    return [
      {
        id: "user-1",
        role: "user",
        body: `I need help planning a trip to Japan`,
      },
      {
        id: "assistant-1",
        role: "assistant",
        body: `I'd be happy to help you plan your trip to Japan! To create the perfect itinerary for you, I'd like to know a few things: When are you planning to visit? How many days will you be staying? And what are your main interests - culture, food, nature, cities, or a mix?`,
      },
      {
        id: "user-2",
        role: "user",
        body: `I'm planning for 10 days in spring, interested in culture and food`,
      },
      {
        id: "assistant-2",
        role: "assistant",
        body: `Perfect timing! Spring is beautiful in Japan with cherry blossoms. For a 10-day culture and food focused trip, I recommend: Tokyo (3 days) - explore traditional temples, modern districts, and incredible food scene; Kyoto (3 days) - ancient temples, traditional tea houses, and kaiseki dining; Osaka (2 days) - known as "Japan's kitchen" with street food and nightlife; Nara (1 day) - historic temples and friendly deer; Plus travel days between cities. Would you like me to create a detailed day-by-day itinerary?`,
      },
    ];
  }, [activeChat]);

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
              {activeChat.title}
            </div>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden px-4 py-4 md:px-6 md:py-6">
        <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="surface-panel flex h-full min-h-0 flex-col overflow-hidden rounded-[1.75rem]">
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
                          {chat.title}
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

          <section className="surface-panel flex h-full min-h-0 flex-col overflow-hidden rounded-[1.75rem]">
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
                  <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
                    <div className="mx-auto max-w-3xl space-y-6">
                      {previewMessages.map((message) => {
                        const isUser = message.role === "user";
                        return (
                          <div
                            key={message.id}
                            className={cn(
                              "flex gap-3",
                              isUser && "flex-row-reverse",
                            )}
                          >
                            <div
                              className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                                isUser
                                  ? "bg-primary/20 text-primary"
                                  : "bg-selection/60 text-primary",
                              )}
                            >
                              {isUser ? (
                                <UserCircle2 className="h-4 w-4" />
                              ) : (
                                <Sparkles className="h-4 w-4" />
                              )}
                            </div>
                            <div
                              className={cn(
                                "flex-1 rounded-2xl px-4 py-3",
                                isUser
                                  ? "bg-primary/12 text-foreground"
                                  : "bg-surface/30 text-foreground",
                              )}
                            >
                              <p className="text-sm leading-relaxed">
                                {message.body}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-selection/50 px-4 py-4 md:px-6">
                    <div className="mx-auto max-w-3xl">
                      <div className="flex items-end gap-3 rounded-2xl border border-selection/60 bg-surface/20 p-3">
                        <Input
                          placeholder={`Message ${activeChat.title}...`}
                          className="min-h-[40px] flex-1 resize-none border-0 bg-transparent px-0 py-2 text-sm shadow-none focus-visible:ring-0"
                        />
                        <Button
                          size="sm"
                          className="h-9 shrink-0 rounded-xl px-4"
                        >
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </section>
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
            <DialogDescription>
              Update the thread title without leaving the sidebar.
            </DialogDescription>
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
