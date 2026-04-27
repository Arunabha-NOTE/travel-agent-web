"use client";

import { Compass, Map as MapIcon, Palmtree, Plane } from "lucide-react";

type Suggestion = {
  icon: React.ReactNode;
  title: string;
  description: string;
  query: string;
};

const SUGGESTIONS: Suggestion[] = [
  {
    icon: <Plane className="h-5 w-5 text-blue-400" />,
    title: "Trip to Paris",
    description: "Explore the Eiffel Tower and Louve museum",
    query:
      "Plan a trip to Paris for 5 days including museums and local bistros.",
  },
  {
    icon: <Palmtree className="h-5 w-5 text-emerald-400" />,
    title: "Japan Adventure",
    description: "Cherry blossoms in Kyoto and neon lights in Tokyo",
    query:
      "Create a 10-day itinerary for Japan covering Tokyo, Kyoto, and Osaka.",
  },
  {
    icon: <Compass className="h-5 w-5 text-purple-400" />,
    title: "Swiss Alps Skiing",
    description: "Best slopes and cozy mountain chalets",
    query:
      "Plan a winter skiing trip to the Swiss Alps with resort recommendations.",
  },
  {
    icon: <MapIcon className="h-5 w-5 text-amber-400" />,
    title: "New York City Tour",
    description: "Central Park, Broadway, and iconic skylines",
    query:
      "Give me a weekend guide for NYC focused on food and Broadway shows.",
  },
];

type SuggestionsProps = {
  onClick: (query: string) => void;
};

export function Suggestions({ onClick }: SuggestionsProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 animate-in fade-in duration-700">
      <div className="w-full max-w-2xl text-center mb-10">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Where to next?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm text-muted leading-relaxed">
          Choose a suggestion below or start typing to begin your personalized
          travel planning session with AI.
        </p>
      </div>

      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.title}
            type="button"
            onClick={() => onClick(s.query)}
            className="group relative flex flex-col items-start rounded-2xl border border-selection/30 bg-surface/30 p-5 text-left transition-all hover:border-primary/50 hover:bg-surface/50 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-selection/20 group-hover:bg-primary/20 transition-colors">
              {s.icon}
            </div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {s.title}
            </h3>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              {s.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
