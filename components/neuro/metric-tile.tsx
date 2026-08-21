import { cn } from "@/lib/utils";

type MetricTileProps = {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
  accent?: boolean;
};

export function MetricTile({
  label,
  value,
  hint,
  className,
  accent,
}: MetricTileProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-graphite bg-obsidian p-5",
        accent && "border-acid-lime/30",
        className
      )}
    >
      <p className="linear-mono text-[12px] text-fog">{label}</p>
      <p className="mt-3 font-mono text-[40px] font-[510] leading-none tracking-tight text-paper sm:text-[48px]">
        {value}
      </p>
      {hint && <p className="mt-1 text-[12px] text-fog">{hint}</p>}
    </div>
  );
}
