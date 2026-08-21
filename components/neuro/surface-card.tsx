import { cn } from "@/lib/utils";

type SurfaceCardProps = {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
};

export function SurfaceCard({
  children,
  className,
  padding = "md",
}: SurfaceCardProps) {
  const paddingClass =
    padding === "sm" ? "p-4" : padding === "lg" ? "p-8" : "p-6";

  return (
    <div
      className={cn(
        "rounded-xl bg-carbon shadow-[rgb(35,37,42)_0px_0px_0px_1px_inset]",
        paddingClass,
        className
      )}
    >
      {children}
    </div>
  );
}
