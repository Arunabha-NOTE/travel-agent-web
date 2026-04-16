"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Icons } from "@/components/icons/icon";
import type {
  ItineraryActivity,
  ItineraryData,
  ItineraryDay,
} from "@/lib/types";
import { cn } from "@/lib/utils";

// Dynamically import map to avoid SSR issues with Leaflet
const ItineraryMap = dynamic(() => import("./itinerary-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted">
      Loading map...
    </div>
  ),
});

type ItineraryCardProps = {
  data: ItineraryData;
  className?: string;
};

const categoryEmoji: Record<string, string> = {
  culture: "🏛️",
  food: "🍜",
  nature: "🌿",
  transport: "🚄",
  accommodation: "🏨",
  shopping: "🛍️",
};

function ActivityItem({ activity }: { activity: ItineraryActivity }) {
  const emoji = categoryEmoji[activity.category ?? ""] ?? "📍";
  return (
    <div className="flex gap-3 py-2">
      <div className="flex flex-col items-center">
        <span className="shrink-0 text-xs font-medium text-muted w-12 text-right">
          {activity.time}
        </span>
      </div>
      <div className="flex-1 border-l border-selection/40 pl-4 pb-2">
        <div className="flex items-start gap-2">
          <span>{emoji}</span>
          <div>
            <p className="text-sm font-medium text-foreground">
              {activity.title}
            </p>
            <p className="mt-0.5 text-xs text-muted">{activity.location}</p>
            <p className="mt-1 text-xs leading-relaxed text-foreground/70">
              {activity.description}
            </p>
            {activity.duration_hours && (
              <p className="mt-1 text-[10px] text-muted">
                ≈ {activity.duration_hours}h
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DayAccordion({ day }: { day: ItineraryDay }) {
  const [open, setOpen] = useState(day.day === 1);
  const { ChevronDown } = Icons;

  return (
    <div className="border-b border-selection/30 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-surface/20 transition-colors"
      >
        <div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Day {day.day}
          </span>
          <p className="text-sm font-medium text-foreground">{day.title}</p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="px-4 pb-2">
          {day.activities.map((activity) => (
            <ActivityItem
              key={`${activity.time}-${activity.title}`}
              activity={activity}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ItineraryCard({ data, className }: ItineraryCardProps) {
  const { MapPin, Calendar, CloudSun, Banknote } = Icons;

  // Collect all activities with coordinates for the map
  const pins = data.days.flatMap((day) =>
    day.activities
      .filter((a) => a.lat && a.lon)
      .map((a) => ({
        lat: a.lat,
        lon: a.lon,
        title: a.title,
        description: a.description,
        day: day.day,
        category: a.category ?? "other",
      })),
  );

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      {/* Header */}
      <div className="shrink-0 border-b border-selection/50 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {data.destination}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {data.total_days} days
              </span>
              {data.best_season && (
                <span className="flex items-center gap-1">
                  <CloudSun className="h-3 w-3" />
                  Best: {data.best_season}
                </span>
              )}
              {data.estimated_budget?.total_estimate && (
                <span className="flex items-center gap-1">
                  <Banknote className="h-3 w-3" />
                  {data.estimated_budget.total_estimate.toLocaleString()}{" "}
                  {data.estimated_budget.currency}
                </span>
              )}
            </div>
          </div>
        </div>

        {data.weather_summary && (
          <p className="mt-2 rounded-lg bg-surface/30 px-3 py-2 text-xs text-foreground/70">
            🌤 {data.weather_summary}
          </p>
        )}
      </div>

      {/* Map */}
      <div className="h-56 shrink-0 border-b border-selection/50">
        <ItineraryMap pins={pins} />
      </div>

      {/* Day accordion */}
      <div className="flex-1 overflow-y-auto">
        {data.days.map((day) => (
          <DayAccordion key={day.day} day={day} />
        ))}

        {/* Tips */}
        {data.tips && data.tips.length > 0 && (
          <div className="px-4 py-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              💡 Tips
            </p>
            <ul className="space-y-1">
              {data.tips.map((tip) => (
                <li key={tip} className="text-xs text-foreground/80">
                  • {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
