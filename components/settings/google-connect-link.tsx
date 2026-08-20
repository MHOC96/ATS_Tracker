import { buttonVariants } from "@/components/ui/button";

type GoogleConnectLinkProps = {
  label: string;
};

/**
 * Full-page navigation to OAuth — do not use Next.js Link (RSC prefetch breaks redirects).
 */
export function GoogleConnectLink({ label }: GoogleConnectLinkProps) {
  return (
    <a href="/api/google/authorize" className={buttonVariants({ size: "sm" })}>
      {label}
    </a>
  );
}
