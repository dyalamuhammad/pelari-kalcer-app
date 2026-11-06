"use client";

import { useState } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "ios-install-banner-dismissed";

function shouldShowBanner(): boolean {
  if (typeof window === "undefined") return false;
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    // @ts-expect-error - properti Safari-only
    window.navigator.standalone === true;
  const dismissed = localStorage.getItem(STORAGE_KEY) === "1";
  return isIos && !isStandalone && !dismissed;
}

export function IosInstallBanner() {
  // Derive saat render — tidak ada setState di effect
  const [dismissed, setDismissed] = useState(false);

  const visible = !dismissed && shouldShowBanner();

  const close = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[1100] flex items-start gap-3 rounded-2xl border border-white/20 bg-neutral-900/95 p-3 text-sm text-white shadow-xl backdrop-blur-md">
      <p className="flex-1 leading-snug">
        Pasang di layar utama: ketuk{" "}
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="inline-block align-text-bottom"
        >
          <path d="M12 3v12M8 7l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
        </svg>{" "}
        lalu <strong>Tambah ke Layar Utama</strong>
      </p>
      <button
        type="button"
        onClick={close}
        aria-label="Tutup"
        className="rounded-full p-1 text-white/70 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}