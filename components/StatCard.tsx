import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string;
  unit?: string;
  icon?: LucideIcon;
  emphasis?: boolean;
  accent?: boolean;
};

export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  emphasis = false,
  accent = false,
}: StatCardProps) {
  return (
    <div
      className={[
        "glass flex flex-col gap-1 rounded-3xl p-4 transition-colors duration-300",
        emphasis ? "col-span-2 p-5" : "",
      ].join(" ")}
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        <span>{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className={[
            "font-extrabold tabular-nums leading-none",
            emphasis ? "text-6xl" : "text-3xl",
            accent ? "text-primary-soft" : "text-ink",
          ].join(" ")}
        >
          {value}
        </span>
        {unit ? (
          <span className="text-sm font-medium text-muted">{unit}</span>
        ) : null}
      </div>
    </div>
  );
}