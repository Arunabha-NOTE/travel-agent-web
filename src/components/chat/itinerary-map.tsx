"use client";

import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix default leaflet marker icons broken by webpack
delete (L.Icon.Default.prototype as typeof L.Icon.Default.prototype & { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const categoryColors: Record<string, string> = {
  culture: "#6366f1",
  food: "#f59e0b",
  nature: "#22c55e",
  transport: "#64748b",
  accommodation: "#8b5cf6",
  shopping: "#ec4899",
  other: "#3b82f6",
};

function createIcon(category: string) {
  const color = categoryColors[category] ?? categoryColors.other;
  return L.divIcon({
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:${color};border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      transform:rotate(-45deg);
    "></div>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

type Pin = {
  lat: number;
  lon: number;
  title: string;
  description: string;
  day: number;
  category: string;
};

function FitBounds({ pins }: { pins: Pin[] }) {
  const map = useMap();
  useEffect(() => {
    if (pins.length === 0) return;
    if (pins.length === 1) {
      map.setView([pins[0].lat, pins[0].lon], 13);
      return;
    }
    const bounds = L.latLngBounds(pins.map((p) => [p.lat, p.lon]));
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [map, pins]);
  return null;
}

type ItineraryMapProps = {
  pins: Pin[];
};

export default function ItineraryMap({ pins }: ItineraryMapProps) {
  const center: [number, number] =
    pins.length > 0 ? [pins[0].lat, pins[0].lon] : [20, 0];

  if (pins.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        No location pins yet
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={5}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds pins={pins} />
      {pins.map((pin) => (
        <Marker
          key={`${pin.lat}-${pin.lon}-${pin.title}`}
          position={[pin.lat, pin.lon]}
          icon={createIcon(pin.category)}
        >
          <Popup>
            <div style={{ minWidth: 160 }}>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>
                Day {pin.day} · {pin.title}
              </p>
              <p style={{ fontSize: 12, color: "#666" }}>{pin.description}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
