"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import type { TrackPoint } from "@/lib/geo";
import "leaflet/dist/leaflet.css";

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
  html: `<div style="width:16px;height:16px;border-radius:9999px;background:#f97316;border:3px solid white;box-shadow:0 0 0 4px rgba(249,115,22,0.3)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

type RunMapProps = {
  points: TrackPoint[];
  currentPosition: { lat: number; lng: number } | null;
  follow?: boolean;
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
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {polyline.length > 1 ? (
          <Polyline
            positions={polyline}
            pathOptions={{ color: "#f97316", weight: 5, opacity: 0.9 }}
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
    </div>
  );
}