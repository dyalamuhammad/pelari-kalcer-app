"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Activity, AlertTriangle, Clock, MapPin, Gauge, Zap } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { ControlButtons } from "@/components/ControlButtons";
import { SummaryView } from "@/components/SummaryView";
import { useRunTracker } from "@/hooks/useRunTracker";
import { useWakeLock } from "@/hooks/useWakeLock";
import { formatTime, formatDistance, formatPace, formatSpeed } from "@/lib/format";

const RunMap = dynamic(() => import("@/components/RunMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse rounded-2xl bg-white/5" />
  ),
});

export default function HomePage() {
  const {
    status,
    points,
    currentPosition,
    stats,
    geoError,
    start,
    pause,
    resume,
    stop,
    reset,
  } = useRunTracker();

  const { isSupported: wakeSupported, isActive: wakeActive, request: requestWake, release: releaseWake } = useWakeLock();

  // Aktifkan wake lock selama recording, lepas saat pause/stop
  const handleStart = () => {
    start();
    if (wakeSupported) void requestWake();
  };

  const handlePause = () => {
    pause();
    if (wakeSupported) void releaseWake();
  };

  const handleResume = () => {
    resume();
    if (wakeSupported) void requestWake();
  };

  const handleStop = () => {
    stop();
    if (wakeSupported) void releaseWake();
  };

  const handleReset = () => {
    reset();
  };

  const avgSpeedKmh = useMemo(() => {
    if (stats.elapsedSec <= 0) return 0;
    return (stats.distanceM / stats.elapsedSec) * 3.6;
  }, [stats.distanceM, stats.elapsedSec]);

  // ==== Layar Summary ====
  if (status === "finished") {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-8 pt-6">
        <SummaryView
          points={points}
          elapsedSec={stats.elapsedSec}
          distanceM={stats.distanceM}
          avgSpeedKmh={avgSpeedKmh}
          onRestart={handleReset}
        />
      </main>
    );
  }

  // ==== Layar Recording / Paused ====
  if (status === "recording" || status === "paused") {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-6 pt-4">
        {/* Peta ~40% tinggi layar */}
        <div className="h-[40vh] w-full">
          <RunMap
            points={points}
            currentPosition={currentPosition}
            follow
            className="h-full w-full"
          />
        </div>

        {/* Kartu statistik */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <StatCard
            label="Waktu"
            value={formatTime(stats.elapsedSec)}
            icon={Clock}
            emphasis
          />
          <StatCard
            label="Jarak"
            value={formatDistance(stats.distanceM)}
            unit="km"
            icon={MapPin}
          />
          <StatCard
            label="Pace"
            value={formatPace(stats.speedKmh)}
            unit="/km"
            icon={Gauge}
          />
          <StatCard
            label="Speed"
            value={formatSpeed(stats.speedKmh)}
            unit="km/j"
            icon={Zap}
          />
        </div>

        {/* Error lokasi */}
        {geoError ? (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{geoError}</span>
          </div>
        ) : null}

        {/* Status paused */}
        {status === "paused" ? (
          <div className="mt-4 rounded-xl border border-orange-500/30 bg-orange-500/10 p-3 text-center text-sm font-medium text-orange-300">
            Lari dijeda — waktu tidak berjalan
          </div>
        ) : null}

        {/* Tombol kontrol */}
        <div className="mt-auto pt-6">
          <ControlButtons
            status={status}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
            onReset={handleReset}
          />
        </div>
      </main>
    );
  }

  // ==== Layar Idle / Home ====
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-8 pt-8">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-orange-400">
          <Activity className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-widest">
            RunTrack
          </span>
        </div>
        <h1 className="text-3xl font-bold leading-tight text-white">
          Siap lari hari ini?
        </h1>
        <p className="text-sm text-zinc-400">
          Tekan tombol mulai. GPS akan merekam rute kamu secara real-time.
        </p>
      </header>

      <div className="mt-6 h-56 w-full">
        <RunMap
          points={[]}
          currentPosition={currentPosition}
          follow
          className="h-full w-full"
        />
      </div>

      {geoError ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{geoError}</span>
        </div>
      ) : null}

      {!wakeSupported ? (
        <p className="mt-4 text-center text-xs text-zinc-500">
          Layar tetap menyala tidak didukung di browser ini.
        </p>
      ) : null}

      <div className="mt-auto pt-8">
        <ControlButtons
          status={status}
          onStart={handleStart}
          onPause={handlePause}
          onResume={handleResume}
          onStop={handleStop}
          onReset={handleReset}
        />
      </div>
    </main>
  );
}