import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string;
  unit?: string;
  icon?: LucideIcon;
  emphasis?: boolean;
};

export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  emphasis = false,
}: StatCardProps) {
  return (
    <div
      className={[
        "flex flex-col gap-1 rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm",
        "transition-colors",
        emphasis ? "col-span-2 p-5" : "",
      ].join(" ")}
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-400">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        <span>{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className={[
            "font-bold tabular-nums leading-none text-white",
            emphasis ? "text-6xl" : "text-3xl",
          ].join(" ")}
        >
          {value}
        </span>
        {unit ? (
          <span className="text-sm font-medium text-zinc-400">{unit}</span>
        ) : null}
      </div>
    </div>
  );
}