"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { haversine, shouldAcceptPoint, type TrackPoint } from "@/lib/geo";

export type RunStatus = "idle" | "recording" | "paused" | "finished";

export type RunStats = {
  elapsedSec: number;
  distanceM: number;
  speedKmh: number;
  paceMinPerKm: number;
};

const SPEED_SMOOTHING_WINDOW = 5;

export function useRunTracker() {
  const [status, setStatus] = useState<RunStatus>("idle");
  const [points, setPoints] = useState<TrackPoint[]>([]);
  const [currentPosition, setCurrentPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [distanceM, setDistanceM] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [paceMinPerKm, setPaceMinPerKm] = useState(0);
  const [geoError, setGeoError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const lastPointRef = useRef<TrackPoint | null>(null);
  const speedSamplesRef = useRef<number[]>([]);
  const startedAtRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number | null>(null);
  const totalPausedMsRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetSamples = () => {
    speedSamplesRef.current = [];
  };

  const pushSpeedSample = (kmh: number) => {
    const arr = speedSamplesRef.current;
    arr.push(kmh);
    if (arr.length > SPEED_SMOOTHING_WINDOW) arr.shift();

    const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
    setSpeedKmh(avg);
    setPaceMinPerKm(avg > 0.1 ? 60 / avg : 0);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const clearWatch = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const startTimer = () => {
    clearTimer();
    timerRef.current = setInterval(() => {
      if (startedAtRef.current === null) return;
      const now = Date.now();
      const pausedTotal =
        totalPausedMsRef.current +
        (pausedAtRef.current ? now - pausedAtRef.current : 0);
      const elapsed = Math.max(0, (now - startedAtRef.current - pausedTotal) / 1000);
      setElapsedSec(elapsed);
    }, 250);
  };

  const handlePosition = useCallback((pos: GeolocationPosition) => {
    const next: TrackPoint = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      timestamp: pos.timestamp,
      accuracy: pos.coords.accuracy,
    };

    setCurrentPosition({ lat: next.lat, lng: next.lng });

    const prev = lastPointRef.current;
    if (!shouldAcceptPoint(prev, next)) return;

    if (prev) {
      const dist = haversine(prev, next);
      const dtSec = (next.timestamp - prev.timestamp) / 1000;
      if (dtSec > 0) {
        const kmh = (dist / dtSec) * 3.6;
        pushSpeedSample(kmh);
      }
      setDistanceM((d) => d + dist);
    }

    lastPointRef.current = next;
    setPoints((p) => [...p, next]);
  }, []);

  const handleGeoError = useCallback((err: GeolocationPositionError) => {
    let msg = "Gagal mendapatkan lokasi.";
    if (err.code === err.PERMISSION_DENIED) {
      msg = "Izin lokasi ditolak. Aktifkan izin lokasi untuk browser ini.";
    } else if (err.code === err.POSITION_UNAVAILABLE) {
      msg = "Lokasi tidak tersedia. Pastikan GPS aktif.";
    } else if (err.code === err.TIMEOUT) {
      msg = "Waktu pengambilan lokasi habis. Coba lagi.";
    }
    setGeoError(msg);
  }, []);

  const beginWatch = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError("Browser ini tidak mendukung Geolocation API.");
      return;
    }
    setGeoError(null);
    clearWatch();
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      handleGeoError,
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    );
  }, [handlePosition, handleGeoError]);

  const start = useCallback(() => {
    setStatus("recording");
    setPoints([]);
    setDistanceM(0);
    setElapsedSec(0);
    setSpeedKmh(0);
    setPaceMinPerKm(0);
    lastPointRef.current = null;
    resetSamples();
    startedAtRef.current = Date.now();
    pausedAtRef.current = null;
    totalPausedMsRef.current = 0;
    startTimer();
    beginWatch();
  }, [beginWatch]);

  const pause = useCallback(() => {
    if (status !== "recording") return;
    setStatus("paused");
    pausedAtRef.current = Date.now();
    clearWatch();
    clearTimer();
  }, [status]);

  const resume = useCallback(() => {
    if (status !== "paused") return;
    if (pausedAtRef.current !== null) {
      totalPausedMsRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
    setStatus("recording");
    startTimer();
    beginWatch();
  }, [status, beginWatch]);

  const stop = useCallback(() => {
    if (status !== "recording" && status !== "paused") return;
    if (pausedAtRef.current !== null) {
      totalPausedMsRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
    setStatus("finished");
    clearWatch();
    clearTimer();
  }, [status]);

  const reset = useCallback(() => {
    clearWatch();
    clearTimer();
    setStatus("idle");
    setPoints([]);
    setCurrentPosition(null);
    setDistanceM(0);
    setElapsedSec(0);
    setSpeedKmh(0);
    setPaceMinPerKm(0);
    setGeoError(null);
    lastPointRef.current = null;
    resetSamples();
    startedAtRef.current = null;
    pausedAtRef.current = null;
    totalPausedMsRef.current = 0;
  }, []);

  useEffect(() => {
    return () => {
      clearWatch();
      clearTimer();
    };
  }, []);

  const stats: RunStats = {
    elapsedSec,
    distanceM,
    speedKmh,
    paceMinPerKm,
  };

  const locate = useCallback(() => {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    setGeoError("Browser ini tidak mendukung Geolocation API.");
    return;
  }
  setGeoError(null);
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setCurrentPosition({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    },
    handleGeoError,
    { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
  );
}, [handleGeoError]);

  return {
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
  };
}