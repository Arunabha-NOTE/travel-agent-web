import type { Metadata } from "next";
import { ItineraryCard } from "@/components/chat/itinerary-card";

type PublicItineraryPageProps = {
  params: Promise<{ chatId: string }>;
};

export async function generateMetadata({
  params,
}: PublicItineraryPageProps): Promise<Metadata> {
  const { chatId } = await params;
  return {
    title: "Shared Itinerary | Travel Concierge",
    description: `View this travel itinerary (Chat ID: ${chatId}) created by AI.`,
  };
}

export default async function PublicItineraryPage({
  params,
}: PublicItineraryPageProps) {
  const { chatId } = await params;

  return (
    <main className="fixed inset-0 bg-[#0A0A0A] overflow-hidden flex flex-col p-4 md:p-8">
      <div className="max-w-6xl mx-auto w-full h-full flex flex-col">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Shared Itinerary
            </h1>
            <p className="text-sm text-white/40 mt-1">
              Live view of the latest travel plan
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
              Public View
            </span>
          </div>
        </header>

        <div className="flex-1 min-h-0 surface-panel rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
          <ItineraryCard chatId={chatId} isPublic={true} isFullscreen={true} />
        </div>

        <footer className="mt-6 text-center">
          <p className="text-[10px] text-white/20">
            Created with Travel Concierge AI · Real-time updates enabled
          </p>
        </footer>
      </div>
    </main>
  );
}
