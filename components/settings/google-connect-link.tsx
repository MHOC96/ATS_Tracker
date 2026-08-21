"use client";

import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { formatCooldownRemaining } from "@/lib/google/oauth-connect-cooldown";
import { cn } from "@/lib/utils";

type GoogleConnectLinkProps = {
  label: string;
  initialRemainingSeconds: number;
};

/**
 * Full-page navigation to OAuth — do not use Next.js Link (RSC prefetch breaks redirects).
 */
export function GoogleConnectLink({
  label,
  initialRemainingSeconds,
}: GoogleConnectLinkProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(
    Math.max(0, initialRemainingSeconds)
  );

  useEffect(() => {
    if (initialRemainingSeconds <= 0) {
      setRemainingSeconds(0);
      return;
    }

    const endsAt = Date.now() + initialRemainingSeconds * 1000;

    const tick = () => {
      setRemainingSeconds(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [initialRemainingSeconds]);

  const onCooldown = remainingSeconds > 0;

  return (
    <div className="space-y-2">
      {onCooldown ? (
        <span
          className={cn(
            buttonVariants({ size: "sm" }),
            "pointer-events-none w-full cursor-not-allowed opacity-50 sm:w-auto"
          )}
          aria-disabled="true"
        >
          {label}
        </span>
      ) : (
        <a
          href="/api/google/authorize"
          className={cn(buttonVariants({ size: "sm" }), "w-full sm:w-auto")}
        >
          {label}
        </a>
      )}
      <p className="text-xs text-muted-foreground">
        {onCooldown ? (
          <>
            You can connect or generate a new refresh token again in{" "}
            <span className="font-mono text-foreground">
              {formatCooldownRemaining(remainingSeconds)}
            </span>
            .
          </>
        ) : (
          <>Connect again anytime if you need a new refresh token.</>
        )}
      </p>
    </div>
  );
}
