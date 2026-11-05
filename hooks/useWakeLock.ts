"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type WakeLockSentinelLike = {
  release: () => Promise<void>;
  released: boolean;
};

export function useWakeLock() {
  const isSupported =
    typeof window !== "undefined" && "wakeLock" in navigator;

  const [isActive, setIsActive] = useState(false);
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null);

  const request = useCallback(async () => {
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) {
      return;
    }
    try {
      const sentinel = (await navigator.wakeLock.request(
        "screen",
      )) as WakeLockSentinelLike;
      sentinelRef.current = sentinel;
      setIsActive(true);

      const originalRelease = sentinel.release.bind(sentinel);
      sentinel.release = async () => {
        setIsActive(false);
        sentinelRef.current = null;
        return originalRelease();
      };
    } catch {
      setIsActive(false);
    }
  }, []);

  const release = useCallback(async () => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    try {
      await sentinel.release();
    } catch {
      // ignore
    }
    sentinelRef.current = null;
    setIsActive(false);
  }, []);

  // Re-acquire saat tab kembali visible (browser auto-release saat hide)
  useEffect(() => {
    const handler = async () => {
      if (
        document.visibilityState === "visible" &&
        sentinelRef.current?.released
      ) {
        await request();
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [request]);

  useEffect(() => {
    return () => {
      void release();
    };
  }, [release]);

  return { isSupported, isActive, request, release };
}