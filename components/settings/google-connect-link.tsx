import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GoogleConnectLinkProps = {
  label: string;
};

/**
 * Full-page navigation to OAuth — do not use Next.js Link (RSC prefetch breaks redirects).
 */
export function GoogleConnectLink({ label }: GoogleConnectLinkProps) {
  return (
    <a
      href="/api/google/authorize"
      className={cn(buttonVariants({ size: "sm" }), "w-full sm:w-auto")}
    >
      {label}
    </a>
  );
}
