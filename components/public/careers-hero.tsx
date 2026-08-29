import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PUBLIC_APP_NAME } from "@/lib/constants/branding";

type CareersHeroProps = {
  openRolesCount: number;
};

export function CareersHero({ openRolesCount }: CareersHeroProps) {
  const hasRoles = openRolesCount > 0;
  const rolesLabel = openRolesCount === 1 ? "role open" : "roles open";

  return (
    <section aria-labelledby="careers-hero-title">
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-graphite bg-carbon",
          "shadow-[rgb(35,37,42)_0px_0px_0px_1px_inset]",
          "bg-[radial-gradient(ellipse_at_top_right,rgba(212,255,0,0.08),transparent_50%)]"
        )}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-acid-lime/5 blur-3xl sm:h-64 sm:w-64"
          aria-hidden
        />

        <div className="relative grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-8 lg:p-7">
          <div className="min-w-0 space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-graphite bg-white/[0.04] px-3 py-1.5 text-[12px] text-mist sm:text-[13px]">
              <span className="size-1.5 shrink-0 rounded-full bg-acid-lime" aria-hidden />
              We&apos;re hiring
            </span>

            <div className="space-y-2.5">
              <p className="text-[13px] font-[510] uppercase tracking-[0.06em] text-mist sm:text-[14px]">
                {PUBLIC_APP_NAME}
              </p>
              <h1
                id="careers-hero-title"
                className="text-balance font-[510] leading-[1.1] tracking-[-0.022em] text-paper [font-size:clamp(1.75rem,4vw+0.5rem,2.625rem)]"
              >
                Open positions
              </h1>

              <p className="max-w-xl text-pretty text-[14px] leading-[1.65] text-fog sm:text-[16px] sm:leading-[1.7]">
                Explore roles that match your skills. Pick a job, upload your CV,
                and apply in a few minutes — we&apos;ll follow up by email.
              </p>
            </div>
          </div>

          {hasRoles ? (
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-stretch lg:min-w-[10.5rem] lg:flex-col">
              <div
                className="flex items-center gap-3 rounded-lg border border-graphite/80 bg-obsidian/50 px-4 py-3"
                aria-label={`${openRolesCount} ${rolesLabel}`}
              >
                <p className="tabular-nums text-[26px] font-[510] leading-none tracking-[-0.02em] text-paper sm:text-[30px]">
                  {openRolesCount}
                </p>
                <p className="text-[13px] leading-snug text-mist">{rolesLabel}</p>
              </div>

              <Link
                href="/jobs"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 w-full justify-center sm:flex-1 lg:flex-none"
                )}
              >
                Browse roles
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          ) : (
            <p className="rounded-lg border border-graphite/80 bg-obsidian/40 px-4 py-3 text-[14px] leading-relaxed text-mist lg:max-w-xs">
              No roles are open right now. Check back soon for new openings.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
