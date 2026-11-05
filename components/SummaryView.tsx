"use client";

import dynamic from "next/dynamic";
import { Clock, MapPin, Gauge, Trophy } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { formatTime, formatDistance, formatPace } from "@/lib/format";
import type { TrackPoint } from "@/lib/geo";

const RunMap = dynamic(() => import("@/components/RunMap"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full animate-pulse rounded-2xl bg-white/5" />
  ),
});

type SummaryViewProps = {
  points: TrackPoint[];
  elapsedSec: number;
  distanceM: number;
  avgSpeedKmh: number;
  onRestart: () => void;
};

export function SummaryView({
  points,
  elapsedSec,
  distanceM,
  avgSpeedKmh,
  onRestart,
}: SummaryViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20 text-orange-400">
          <Trophy className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Rute selesai</h2>
          <p className="text-sm text-zinc-400">Rekap hasil lari kamu</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Waktu"
          value={formatTime(elapsedSec)}
          icon={Clock}
          emphasis
        />
        <StatCard
          label="Jarak"
          value={formatDistance(distanceM)}
          unit="km"
          icon={MapPin}
        />
        <StatCard
          label="Rata-rata pace"
          value={formatPace(avgSpeedKmh)}
          unit="/km"
          icon={Gauge}
        />
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-zinc-400">
          Peta rute
        </p>
        <RunMap
          points={points}
          currentPosition={null}
          follow={false}
          className="h-64 w-full"
        />
      </div>

      <button
        onClick={onRestart}
        className="rounded-2xl bg-orange-500 px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-orange-400 active:scale-[0.98]"
      >
        Lari lagi
      </button>
    </div>
  );
}