"use client";

import { Pause, Play, Square, RotateCcw } from "lucide-react";
import type { RunStatus } from "@/hooks/useRunTracker";

type ControlButtonsProps = {
  status: RunStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
};

function BigRoundButton({
  onClick,
  label,
  icon: Icon,
  variant = "primary",
}: {
  onClick: () => void;
  label: string;
  icon: typeof Play;
  variant?: "primary" | "danger" | "neutral";
}) {
  const variants: Record<string, string> = {
    primary:
      "bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-500/30",
    danger:
      "bg-red-500/90 hover:bg-red-500 text-white shadow-lg shadow-red-500/30",
    neutral:
      "bg-white/10 hover:bg-white/15 text-white border border-white/10",
  };

  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={[
        "flex h-20 w-20 items-center justify-center rounded-full",
        "transition-transform active:scale-95",
        variants[variant],
      ].join(" ")}
    >
      <Icon className="h-8 w-8" strokeWidth={2.5} />
    </button>
  );
}

export function ControlButtons({
  status,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
}: ControlButtonsProps) {
  if (status === "idle") {
    return (
      <div className="flex justify-center">
        <BigRoundButton
          onClick={onStart}
          label="Mulai lari"
          icon={Play}
          variant="primary"
        />
      </div>
    );
  }

  if (status === "recording") {
    return (
      <div className="flex items-center justify-center gap-6">
        <BigRoundButton
          onClick={onPause}
          label="Jeda"
          icon={Pause}
          variant="neutral"
        />
        <BigRoundButton
          onClick={onStop}
          label="Berhenti"
          icon={Square}
          variant="danger"
        />
      </div>
    );
  }

  if (status === "paused") {
    return (
      <div className="flex items-center justify-center gap-6">
        <BigRoundButton
          onClick={onResume}
          label="Lanjut"
          icon={Play}
          variant="primary"
        />
        <BigRoundButton
          onClick={onStop}
          label="Berhenti"
          icon={Square}
          variant="danger"
        />
      </div>
    );
  }

  // finished
  return (
    <div className="flex justify-center">
      <BigRoundButton
        onClick={onReset}
        label="Lari lagi"
        icon={RotateCcw}
        variant="primary"
      />
    </div>
  );
}