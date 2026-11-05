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
    primary: "glass-primary hover:brightness-110",
    danger: "glass border-red-500/60 text-red-400 hover:border-red-500",
    neutral: "glass text-white hover:brightness-110",
  };

  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={[
        "flex h-20 w-20 items-center justify-center rounded-full",
        "transition-transform duration-200 active:scale-95",
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