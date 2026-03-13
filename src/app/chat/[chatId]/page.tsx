import { ChatWorkspace } from "@/components/chat/chat-workspace";

type ChatDetailPageProps = {
  params: Promise<{ chatId: string }>;
};

export default async function ChatDetailPage({ params }: ChatDetailPageProps) {
  const { chatId } = await params;
  const parsedChatId = Number(chatId);
  const selectedChatId = Number.isFinite(parsedChatId)
    ? parsedChatId
    : undefined;

  return <ChatWorkspace selectedChatId={selectedChatId} />;
}
