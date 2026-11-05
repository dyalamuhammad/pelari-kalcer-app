"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import type { TrackPoint } from "@/lib/geo";
import "leaflet/dist/leaflet.css";
import { LocateFixed } from "lucide-react";

// Perbaiki ikon default Leaflet yang hilang di bundler modern
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const currentIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative;width:20px;height:20px">
      <span style="position:absolute;inset:0;border-radius:9999px;background:#0A84FF;opacity:.5;animation:pulse 1.8s ease-out infinite"></span>
      <span style="position:absolute;inset:3px;border-radius:9999px;background:#0A84FF;border:2px solid white;box-shadow:0 0 0 4px rgba(10,132,255,.25)"></span>
    </div>
    <style>
      @keyframes pulse{0%{transform:scale(.6);opacity:.6}100%{transform:scale(2);opacity:0}}
      @media (prefers-reduced-motion: reduce){span{animation:none!important}}
    </style>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

type RunMapProps = {
  points: TrackPoint[];
  currentPosition: { lat: number; lng: number } | null;
  follow?: boolean;
  onLocate?: () => void;
  className?: string;
};

function MapFollower({
  center,
  follow,
}: {
  center: { lat: number; lng: number } | null;
  follow: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!follow || !center) return;
    map.setView([center.lat, center.lng], map.getZoom(), { animate: true });
  }, [center, follow, map]);

  return null;
}

function FitBounds({ points }: { points: TrackPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length < 2) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [32, 32] });
  }, [points, map]);

  return null;
}

export default function RunMap({
  points,
  currentPosition,
  follow = true,
  onLocate,
  className = "",
}: RunMapProps) {
  const polyline = useMemo(
    () => points.map((p) => [p.lat, p.lng] as [number, number]),
    [points],
  );

  const initialCenter: [number, number] = currentPosition
    ? [currentPosition.lat, currentPosition.lng]
    : [-6.2, 106.816666]; // fallback Jakarta

  return (
    <div className={`overflow-hidden rounded-2xl ${className}`}>
      <MapContainer
        center={initialCenter}
        zoom={16}
        scrollWheelZoom={false}
        zoomControl={false}
        className="h-full w-full"
      >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url={`https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${process.env.NEXT_PUBLIC_CARTO_KEY}`}
        maxZoom={20}
      />

      {polyline.length > 1 ? (
        <Polyline
          positions={polyline}
          pathOptions={{
            color: "#64D2FF",
            weight: 5,
            opacity: 0.95,
            lineCap: "round",
            lineJoin: "round",
          }}
        />
      ) : null}

        {points.length > 0 ? (
          <Marker
            position={[points[0].lat, points[0].lng]}
            icon={defaultIcon}
          />
        ) : null}

        {currentPosition ? (
          <Marker
            position={[currentPosition.lat, currentPosition.lng]}
            icon={currentIcon}
          />
        ) : null}

        <MapFollower center={currentPosition} follow={follow} />
        <FitBounds points={points} />
      </MapContainer>
        {onLocate ? (
      <button
        type="button"
        onClick={onLocate}
        aria-label="Pusatkan ke lokasi saya"
        className="glass absolute bottom-3 right-3 z-[1000] flex h-11 w-11 items-center justify-center rounded-full text-white transition-transform duration-200 hover:brightness-110 active:scale-95"
      >
        <LocateFixed className="h-5 w-5" />
      </button>
    ) : null}
    </div>
  );
}