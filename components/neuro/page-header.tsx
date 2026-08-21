import { NeuroLabel } from "@/components/neuro/neuro-label";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  label?: string;
  title: string;
  description?: string;
  className?: string;
};

export function PageHeader({
  label,
  title,
  description,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("space-y-3", className)}>
      {label && <NeuroLabel muted>{label}</NeuroLabel>}
      <h1 className="text-[28px] font-[510] tracking-[-0.012em] text-paper sm:text-[32px] lg:text-[40px]">
        {title}
      </h1>
      {description && (
        <p className="max-w-2xl text-[15px] leading-relaxed text-fog">
          {description}
        </p>
      )}
    </header>
  );
}
