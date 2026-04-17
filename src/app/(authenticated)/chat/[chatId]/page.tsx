import { ChatWorkspace } from "@/components/chat/chat-workspace";

type ChatDetailPageProps = {
  params: Promise<{ chatId: string }>;
};

export default async function ChatDetailPage({ params }: ChatDetailPageProps) {
  const { chatId } = await params;
  return <ChatWorkspace selectedChatId={chatId} />;
}
