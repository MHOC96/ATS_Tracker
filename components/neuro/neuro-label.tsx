import { cn } from "@/lib/utils";

type NeuroLabelProps = {
  children: React.ReactNode;
  className?: string;
  muted?: boolean;
};

export function NeuroLabel({ children, className, muted }: NeuroLabelProps) {
  return (
    <span
      className={cn(
        "linear-mono text-[12px] uppercase tracking-wider",
        muted ? "text-fog" : "text-acid-lime",
        className
      )}
    >
      {children}
    </span>
  );
}
