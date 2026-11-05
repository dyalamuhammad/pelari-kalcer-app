"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo } from "react";
import { Activity, AlertTriangle, Clock, MapPin, Gauge } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { ControlButtons } from "@/components/ControlButtons";
import { SummaryView } from "@/components/SummaryView";
import { useRunTracker } from "@/hooks/useRunTracker";
import { useWakeLock } from "@/hooks/useWakeLock";
import { formatTime, formatDistance, formatPace } from "@/lib/format";

const RunMap = dynamic(() => import("@/components/RunMap"), {
  ssr: false,
  loading: () => (
    <div className="glass h-full w-full animate-pulse rounded-3xl" />
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
    locate,
  } = useRunTracker();

  const {
    isSupported: wakeSupported,
    request: requestWake,
    release: releaseWake,
  } = useWakeLock();

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
  const handleReset = () => reset();

  const avgSpeedKmh = useMemo(() => {
    if (stats.elapsedSec <= 0) return 0;
    return (stats.distanceM / stats.elapsedSec) * 3.6;
  }, [stats.distanceM, stats.elapsedSec]);

    useEffect(() => {
    if (status === "idle") locate();
  }, [status, locate]);

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

  if (status === "recording" || status === "paused") {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-6 pt-4">
        <div className="relative h-[40vh] w-full">
          <RunMap
            points={points}
            currentPosition={currentPosition}
            follow
            onLocate={locate}
            className="h-full w-full rounded-3xl"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 rounded-b-3xl bg-gradient-to-t from-black/60 to-transparent" />
        </div>

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
            accent
          />
        </div>

        {geoError ? (
          <div className="mt-4 flex items-start gap-2 rounded-3xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{geoError}</span>
          </div>
        ) : null}

        {status === "paused" ? (
          <div className="mt-4 rounded-3xl border border-yellow-500/40 bg-yellow-500/10 p-3 text-center text-sm font-medium text-yellow-300">
            Lari dijeda — waktu tidak berjalan
          </div>
        ) : null}

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

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-8 pt-8">
      <header className="glass flex flex-col gap-1 rounded-3xl p-5">
        <div className="flex items-center gap-2 text-primary-soft">
          <Activity className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-widest">
            SpeedTrack
          </span>
        </div>
        <h1 className="text-3xl font-bold leading-tight text-ink">
          Siap lari hari ini?
        </h1>
        <p className="text-sm text-muted">
          Tekan tombol mulai. GPS akan merekam rute kamu secara real-time.
        </p>
      </header>

      <div className="relative mt-6 h-56 w-full">
        <RunMap
          points={[]}
          currentPosition={currentPosition}
          follow
            onLocate={locate}
          className="h-full w-full rounded-3xl"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 rounded-b-3xl bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {geoError ? (
        <div className="mt-4 flex items-start gap-2 rounded-3xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{geoError}</span>
        </div>
      ) : null}

      {!wakeSupported ? (
        <p className="mt-4 text-center text-xs text-muted">
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