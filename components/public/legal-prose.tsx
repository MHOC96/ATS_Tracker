import { cn } from "@/lib/utils";

type LegalProseProps = {
  children: React.ReactNode;
  className?: string;
};

export function LegalProse({ children, className }: LegalProseProps) {
  return (
    <div
      className={cn(
        "space-y-6 text-[14px] leading-relaxed text-mist [&_h2]:mt-8 [&_h2]:text-[16px] [&_h2]:font-[510] [&_h2]:text-paper [&_h2]:first:mt-0 [&_li]:mt-1 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_p]:text-mist [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5",
        className
      )}
    >
      {children}
    </div>
  );
}

type LegalSectionProps = {
  title: string;
  children: React.ReactNode;
};

export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
