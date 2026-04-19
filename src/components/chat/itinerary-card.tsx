"use client";

import {
  AlertTriangle,
  Bed,
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Cloud,
  DollarSign,
  ExternalLink,
  Globe,
  Hotel,
  Info,
  Landmark,
  Loader2,
  MapPin,
  Maximize2,
  Minimize2,
  Plane,
  PlaneTakeoff,
  ShoppingBag,
  Star,
  Sun,
  Train,
  Utensils,
  Wallet,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useItineraryQuery } from "@/lib/query/chat.query";
import type {
  Activity,
  FlightSegment,
  HotelData,
  ItineraryData,
} from "@/lib/schemas/auth.schemas";

// Dynamic import — leaflet cannot run on the server
const ItineraryMap = dynamic(() => import("@/components/chat/itinerary-map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-xs text-white/30">
      Loading map…
    </div>
  ),
});

// ─── helpers ────────────────────────────────────────────────────────────────

function formatMins(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function formatCurrency(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

function stars(n: number): string {
  return "★".repeat(Math.min(5, Math.round(n)));
}

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  culture: <Landmark size={12} />,
  food: <Utensils size={12} />,
  nature: <Sun size={12} />,
  transport: <Train size={12} />,
  accommodation: <Hotel size={12} />,
  shopping: <ShoppingBag size={12} />,
  nightlife: <Star size={12} />,
};

const CATEGORY_COLOR: Record<string, string> = {
  culture: "bg-purple-500/15 text-purple-300",
  food: "bg-orange-500/15 text-orange-300",
  nature: "bg-emerald-500/15 text-emerald-300",
  transport: "bg-blue-500/15 text-blue-300",
  accommodation: "bg-pink-500/15 text-pink-300",
  shopping: "bg-yellow-500/15 text-yellow-300",
  nightlife: "bg-indigo-500/15 text-indigo-300",
};

// ─── sub-components ──────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/10 text-white/80">
        {icon}
      </span>
      <h3 className="text-sm font-semibold text-white/90">{title}</h3>
      {badge && (
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60">
          {badge}
        </span>
      )}
    </div>
  );
}

function hasMeaningfulFlightLeg(
  leg: ItineraryData["flights"] extends infer T
    ? T extends { outbound?: infer L | null; return?: infer R | null }
      ? (L | R | null)
      : never
    : never,
) {
  if (!leg || !Array.isArray(leg.segments) || leg.segments.length === 0) {
    return false;
  }

  return leg.segments.some((seg) => {
    const fromAirport = seg.from_airport?.trim().toUpperCase();
    const toAirport = seg.to_airport?.trim().toUpperCase();
    return (
      !!seg.airline &&
      fromAirport &&
      toAirport &&
      fromAirport !== "TBD" &&
      toAirport !== "TBD"
    );
  });
}

function FlightLegCard({
  title,
  leg,
}: {
  title: string;
  leg: NonNullable<NonNullable<ItineraryData["flights"]>["outbound"]>;
}) {
  const segments = leg.segments ?? [];
  if (!hasMeaningfulFlightLeg(leg)) return null;

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <SectionHeader
        icon={<Plane size={14} />}
        title={title}
        badge={leg.cabin_class ?? "economy"}
      />

      {/* Route pill */}
      <div className="flex items-center gap-1 flex-wrap mb-3">
        {segments.map((seg, i) => (
          <span
            key={`${seg.from_airport}-${seg.to_airport}-${i}`}
            className="flex items-center gap-1"
          >
            <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded">
              {seg.from_airport}
              {seg.from_terminal ? (
                <span className="text-white/50 text-[10px] ml-1">
                  {seg.from_terminal}
                </span>
              ) : null}
            </span>
            <ChevronRight size={10} className="text-white/30" />
            <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded">
              {seg.to_airport}
              {seg.to_terminal ? (
                <span className="text-white/50 text-[10px] ml-1">
                  {seg.to_terminal}
                </span>
              ) : null}
            </span>
            {i < segments.length - 1 && (
              <span className="text-white/30 text-[10px]">·</span>
            )}
          </span>
        ))}
      </div>

      {/* Segments detail */}
      <div className="space-y-2 mb-3">
        {segments.map((seg, i) => (
          <FlightSegmentRow
            key={`${seg.from_airport}-${seg.to_airport}-${i}`}
            seg={seg}
            isLast={i === segments.length - 1}
          />
        ))}
      </div>

      {/* Price + duration */}
      <div className="flex items-center justify-between text-xs text-white/60 border-t border-white/10 pt-2 mt-2">
        {leg.total_duration_mins ? (
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {formatMins(leg.total_duration_mins)} total
          </span>
        ) : null}
        {leg.price_per_person ? (
          <span className="flex items-center gap-1 font-semibold text-white/80">
            <Wallet size={11} />
            {formatCurrency(leg.price_per_person, leg.currency ?? "INR")}
            /pax
          </span>
        ) : null}
      </div>
    </div>
  );
}

function FlightCard({ data }: { data: ItineraryData }) {
  const outbound = data.flights?.outbound ?? null;
  const returnLeg = data.flights?.return ?? null;
  const hasOutbound = hasMeaningfulFlightLeg(outbound);
  const hasReturn = hasMeaningfulFlightLeg(returnLeg);

  if (!hasOutbound && !hasReturn) return null;

  return (
    <div className="space-y-3">
      {hasOutbound && outbound ? (
        <FlightLegCard title="Outbound Flight" leg={outbound} />
      ) : null}
      {hasReturn && returnLeg ? (
        <FlightLegCard title="Return Flight" leg={returnLeg} />
      ) : null}
    </div>
  );
}

function FlightSegmentRow({
  seg,
  isLast,
}: {
  seg: FlightSegment;
  isLast: boolean;
}) {
  return (
    <div>
      <div className="flex items-start gap-2">
        <PlaneTakeoff size={12} className="mt-0.5 text-blue-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-white/90">
              {seg.airline}
            </span>
            {seg.flight_number && (
              <span className="text-[10px] text-white/40 font-mono">
                {seg.flight_number}
              </span>
            )}
          </div>
          <div className="text-[11px] text-white/50 mt-0.5">
            {seg.departure && <span>{seg.departure}</span>}
            {seg.departure && seg.arrival && (
              <span className="mx-1 text-white/20">→</span>
            )}
            {seg.arrival && <span>{seg.arrival}</span>}
            {seg.duration_mins ? (
              <span className="ml-2 text-white/40">
                ({formatMins(seg.duration_mins)})
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Layover transit warning */}
      {!isLast && seg.layover_transit_mins != null && (
        <div className="ml-5 mt-1 mb-1 text-[11px] text-amber-400/80 flex items-center gap-1 bg-amber-500/10 rounded px-2 py-1">
          <AlertTriangle size={10} />
          Terminal transfer ~{formatMins(seg.layover_transit_mins)} — allow
          extra time
        </div>
      )}
    </div>
  );
}

function HotelCard({ hotel }: { hotel: NonNullable<HotelData> }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <SectionHeader icon={<Bed size={14} />} title="Hotel" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white/90">{hotel.name}</p>
          {hotel.stars && (
            <p className="text-xs text-yellow-400 mt-0.5">
              {stars(hotel.stars)}
            </p>
          )}
          {hotel.address && (
            <p className="text-[11px] text-white/50 mt-1">{hotel.address}</p>
          )}
          {hotel.loyalty_program && (
            <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded-full">
              <Star size={9} />
              {hotel.loyalty_program}
            </span>
          )}
        </div>
        {hotel.price_per_night != null && (
          <div className="text-right shrink-0">
            <p className="text-sm font-bold text-white/90">
              {formatCurrency(hotel.price_per_night, hotel.currency ?? "EUR")}
            </p>
            <p className="text-[10px] text-white/40">per night</p>
          </div>
        )}
      </div>
      {hotel.booking_notes && (
        <p className="mt-2 text-[11px] text-amber-300/70 flex items-start gap-1">
          <Info size={10} className="mt-0.5 shrink-0" />
          {hotel.booking_notes}
        </p>
      )}
    </div>
  );
}

function ActivityRow({ act }: { act: Activity }) {
  const [open, setOpen] = useState(false);
  const cat = act.category?.toLowerCase() ?? "";
  const hasExtra =
    act.ticket?.cost != null ||
    act.transit_from_prev ||
    act.opening_hours ||
    act.weather_tip ||
    act.ticket?.advance_booking_required;

  const durationMins =
    act.duration_mins ?? (act.duration_hours ? act.duration_hours * 60 : null);

  return (
    <div className="relative">
      {/* Transit from previous */}
      {act.transit_from_prev?.mode && (
        <div className="flex items-center gap-1.5 ml-4 mb-1.5 text-[10px] text-blue-300/70">
          <div className="w-px h-4 bg-white/10 mx-1 shrink-0" />
          <Train size={9} className="shrink-0" />
          <span>{act.transit_from_prev.mode}</span>
          {act.transit_from_prev.duration_mins != null && (
            <span className="text-white/40">
              · {formatMins(act.transit_from_prev.duration_mins)}
            </span>
          )}
          {act.transit_from_prev.cost != null && (
            <span className="text-white/40">
              ·{" "}
              {formatCurrency(
                act.transit_from_prev.cost,
                act.transit_from_prev.currency ?? "EUR",
              )}
            </span>
          )}
        </div>
      )}

      {/* Activity card */}
      <button
        type="button"
        onClick={() => hasExtra && setOpen((o) => !o)}
        className={`w-full text-left group bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] rounded-lg px-3 py-2.5 transition-colors ${hasExtra ? "cursor-pointer" : "cursor-default"}`}
      >
        <div className="flex items-start gap-2">
          {/* Time */}
          <span className="text-[11px] font-mono text-white/40 w-10 shrink-0 mt-0.5">
            {act.time}
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-medium text-white/90 truncate">
                {act.title}
              </span>

              {/* Category pill */}
              {cat && (
                <span
                  className={`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full ${CATEGORY_COLOR[cat] ?? "bg-white/10 text-white/50"}`}
                >
                  {CATEGORY_ICON[cat]}
                  {cat}
                </span>
              )}

              {/* Advance booking badge */}
              {act.ticket?.advance_booking_required && (
                <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-300">
                  <BookOpen size={8} />
                  Book ahead
                </span>
              )}
            </div>

            {/* Duration + location row */}
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {durationMins != null && (
                <span className="text-[10px] text-white/40 flex items-center gap-0.5">
                  <Clock size={9} />
                  {formatMins(durationMins)}
                </span>
              )}
              {act.location && (
                <span className="text-[10px] text-white/40 flex items-center gap-0.5 truncate max-w-[180px]">
                  <MapPin size={9} />
                  {act.location}
                </span>
              )}
            </div>

            {act.description && (
              <p className="text-[11px] text-white/50 mt-1 line-clamp-2">
                {act.description}
              </p>
            )}
          </div>

          {/* Ticket price (always visible) */}
          {act.ticket?.cost != null && (
            <div className="text-right shrink-0">
              <p className="text-xs font-semibold text-white/80">
                {formatCurrency(act.ticket.cost, act.ticket.currency ?? "EUR")}
              </p>
              {act.ticket.as_of && (
                <p className="text-[9px] text-white/30">~{act.ticket.as_of}</p>
              )}
            </div>
          )}

          {hasExtra && (
            <span className="text-white/20 shrink-0 mt-1">
              {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </span>
          )}
        </div>
      </button>

      {/* Expanded details */}
      {open && (
        <div className="mt-1 ml-12 space-y-1.5 text-[11px] animate-in fade-in slide-in-from-top-1">
          {act.opening_hours && (
            <div className="flex items-center gap-1 text-white/50">
              <Clock size={10} />
              <span>{act.opening_hours}</span>
            </div>
          )}
          {act.weather_tip && (
            <div className="flex items-center gap-1 text-sky-300/70">
              <Cloud size={10} />
              <span>{act.weather_tip}</span>
            </div>
          )}
          {act.ticket?.booking_url && (
            <a
              href={act.ticket.booking_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-blue-400/80 hover:text-blue-400 transition-colors"
            >
              <ExternalLink size={10} />
              Book tickets
              {act.ticket.booking_lead_time && (
                <span className="text-white/30">
                  · {act.ticket.booking_lead_time}
                </span>
              )}
            </a>
          )}
          {act.transit_from_prev?.notes && (
            <div className="flex items-start gap-1 text-white/40 italic">
              <Info size={10} className="mt-0.5 shrink-0" />
              {act.transit_from_prev.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DayPanel({ day }: { day: ItineraryData["days"][0] }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 text-left mb-2 group"
      >
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold shrink-0">
          {day.day}
        </span>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-white/80 group-hover:text-white transition-colors">
            {day.title || `Day ${day.day}`}
          </span>
          {day.date && (
            <span className="ml-2 text-[10px] text-white/30">{day.date}</span>
          )}
        </div>
        {day.day_notes && (
          <span className="text-[10px] text-amber-300/80 mr-2 hidden sm:block max-w-[320px] text-right truncate">
            {day.day_notes}
          </span>
        )}
        {open ? (
          <ChevronUp size={12} className="text-white/30 shrink-0" />
        ) : (
          <ChevronDown size={12} className="text-white/30 shrink-0" />
        )}
      </button>

      {open && (
        <div className="space-y-1.5 pl-2 border-l border-white/10 ml-3">
          {day.activities.map((act) => (
            <ActivityRow
              key={`${day.day}-${act.time}-${act.title.slice(0, 16)}`}
              act={act}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BudgetPanel({
  budget,
}: {
  budget: NonNullable<ItineraryData["estimated_budget"]>;
}) {
  const items = [
    {
      label: "Flights",
      value: budget.flights_total,
      icon: <Plane size={11} />,
    },
    {
      label: "Hotel",
      value: budget.accommodation_total ?? budget.accommodation_per_night,
      icon: <Hotel size={11} />,
    },
    {
      label: "Activities",
      value: budget.activities_total,
      icon: <Landmark size={11} />,
    },
    {
      label: "Food/day",
      value: budget.food_per_day,
      icon: <Utensils size={11} />,
    },
    {
      label: "Transit/day",
      value: budget.local_transport_per_day,
      icon: <Train size={11} />,
    },
  ].filter((i) => i.value != null);

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <SectionHeader icon={<DollarSign size={14} />} title="Estimated Budget" />
      <div className="space-y-1.5 mb-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between text-xs"
          >
            <span className="flex items-center gap-1.5 text-white/50">
              {item.icon}
              {item.label}
            </span>
            <span className="text-white/70 font-medium">
              {formatCurrency(item.value ?? 0, budget.currency ?? "USD")}
            </span>
          </div>
        ))}
      </div>
      {budget.total_estimate != null && (
        <div className="flex items-center justify-between border-t border-white/10 pt-2 mt-1">
          <span className="text-xs font-semibold text-white/70">
            Total estimate
          </span>
          <span className="text-sm font-bold text-white">
            {formatCurrency(budget.total_estimate, budget.currency ?? "USD")}
          </span>
        </div>
      )}
      <p className="text-[10px] text-white/30 mt-2">
        * Estimates only. Verify prices before booking.
      </p>
    </div>
  );
}

// ─── main card ──────────────────────────────────────────────────────────────

interface ItineraryCardProps {
  chatId: string;
  liveUpdates?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function ItineraryCard({
  chatId,
  liveUpdates = false,
  isFullscreen,
  onToggleFullscreen,
}: ItineraryCardProps) {
  const { data, isLoading, isError } = useItineraryQuery(chatId, liveUpdates);
  // Hook must be called unconditionally before any early returns
  const [activeTab, setActiveTab] = useState<"plan" | "map">("plan");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-white/30">
        <Loader2 size={28} className="animate-spin" />
        <p className="text-xs">Loading itinerary…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-white/30 px-6 text-center">
        <MapPin size={32} className="opacity-30" />
        <p className="text-sm font-medium text-white/40">No itinerary yet</p>
        <p className="text-xs text-white/25 leading-relaxed">
          Start a conversation — the agent will guide you through flights,
          hotels, and attractions step by step.
        </p>
      </div>
    );
  }

  const it = data.itinerary_data;

  // Build map pins from all geocoded activities + hotel
  type Pin = {
    lat: number;
    lon: number;
    title: string;
    description: string;
    day: number;
    category: string;
  };
  const pins: Pin[] = [];
  for (const day of it.days) {
    for (const act of day.activities) {
      if (act.lat && act.lon && act.lat !== 0 && act.lon !== 0) {
        pins.push({
          lat: act.lat,
          lon: act.lon,
          title: act.title,
          description: act.description ?? "",
          day: day.day,
          category: act.category ?? "other",
        });
      }
    }
  }
  if (it.hotel?.lat && it.hotel?.lon && it.hotel.lat !== 0) {
    pins.push({
      lat: it.hotel.lat,
      lon: it.hotel.lon,
      title: it.hotel.name,
      description: it.hotel.address ?? "Hotel",
      day: 0,
      category: "accommodation",
    });
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-4 pt-3 pb-1 shrink-0 border-b border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab("plan")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === "plan"
              ? "bg-white/15 text-white"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          <MapPin size={12} /> Plan
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("map")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === "map"
              ? "bg-white/15 text-white"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          <Globe size={12} /> Map
          {pins.length > 0 && (
            <span className="ml-0.5 text-[9px] bg-blue-500/30 text-blue-300 px-1.5 py-0.5 rounded-full">
              {pins.length}
            </span>
          )}
        </button>
        <div className="flex-1" />
        {onToggleFullscreen && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/10 rounded-lg transition-colors"
            title={isFullscreen ? "Minimize" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        )}
      </div>
      {/* Map tab */}
      {activeTab === "map" && (
        <div className="flex-1 min-h-0 m-3 rounded-xl overflow-hidden border border-white/10">
          <ItineraryMap pins={pins} />
        </div>
      )}
      {/* Plan tab */}
      {activeTab === "plan" && (
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          <div className="p-4 space-y-4 pb-8">
            {/* Header */}
            <div className="text-center pb-1">
              <h2 className="text-base font-bold text-white truncate">
                {it.destination}
              </h2>
              <div className="flex items-center justify-center gap-3 text-[11px] text-white/40 mt-1 flex-wrap">
                {it.start_date && it.end_date && (
                  <span className="flex items-center gap-1">
                    <Calendar size={10} />
                    {it.start_date} → {it.end_date}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Sun size={10} />
                  {it.total_days} day{it.total_days !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Seasonal warnings */}
            {(it.seasonal_warnings?.length ?? 0) > 0 && (
              <div className="space-y-1">
                {it.seasonal_warnings?.map((w) => (
                  <div
                    key={w.slice(0, 40)}
                    className="flex items-start gap-2 text-[11px] text-amber-300/80 bg-amber-500/10 rounded-lg px-3 py-2"
                  >
                    <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                    {w}
                  </div>
                ))}
              </div>
            )}

            {/* Weather */}
            {(it.weather_summary || it.best_season) && (
              <div className="flex gap-3 flex-wrap">
                {it.weather_summary && (
                  <div className="flex items-center gap-1.5 text-[11px] text-sky-300/70 bg-sky-500/10 rounded-lg px-3 py-1.5 flex-1">
                    <Cloud size={11} />
                    <span>{it.weather_summary}</span>
                  </div>
                )}
                {it.best_season && (
                  <div className="flex items-center gap-1.5 text-[11px] text-yellow-300/70 bg-yellow-500/10 rounded-lg px-3 py-1.5 flex-1">
                    <Sun size={11} />
                    <span>Best: {it.best_season}</span>
                  </div>
                )}
              </div>
            )}

            {/* Flights */}
            {it.flights && <FlightCard data={it} />}

            {/* Hotel */}
            {it.hotel && <HotelCard hotel={it.hotel} />}

            {/* Itinerary days */}
            {it.days.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <SectionHeader
                  icon={<MapPin size={14} />}
                  title="Day-by-Day Plan"
                  badge={`${it.days.length} days`}
                />
                <div>
                  {it.days.map((d) => (
                    <DayPanel key={d.day} day={d} />
                  ))}
                </div>
              </div>
            )}

            {/* Budget */}
            {it.estimated_budget && (
              <BudgetPanel budget={it.estimated_budget} />
            )}

            {/* Tips */}
            {(it.tips?.length ?? 0) > 0 && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <SectionHeader icon={<Info size={14} />} title="Travel Tips" />
                <ul className="space-y-1.5">
                  {it.tips?.map((tip) => (
                    <li
                      key={tip.slice(0, 40)}
                      className="flex items-start gap-2 text-[11px] text-white/60"
                    >
                      <Check
                        size={10}
                        className="text-emerald-400 mt-0.5 shrink-0"
                      />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Updated at */}
            <p className="text-center text-[10px] text-white/20">
              Updated {new Date(data.updated_at).toLocaleString()}
            </p>
          </div>
        </div>
      )}{" "}
      {/* end plan tab */}
    </div>
  );
}
