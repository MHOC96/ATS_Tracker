import Link from "next/link";
import { ArrowRight, Briefcase } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CareersHeroProps = {
  openRolesCount: number;
};

export function CareersHero({ openRolesCount }: CareersHeroProps) {
  const hasRoles = openRolesCount > 0;
  const positionsLabel =
    openRolesCount === 1 ? "Open position" : "Open positions";

  return (
    <section
      className="relative overflow-hidden border-b border-graphite pb-10 sm:pb-12 lg:pb-16"
      aria-labelledby="careers-hero-title"
    >
      <div
        className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-acid-lime/5 blur-3xl sm:h-80 sm:w-80"
        aria-hidden
      />

      <div className="relative grid gap-8 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-0 lg:items-stretch">
        {/* Primary message */}
        <div className="flex flex-col gap-5 sm:gap-6 lg:col-span-7 lg:py-2">
          <div className="flex flex-wrap items-center justify-between gap-3 gap-y-2">
            <span
              className="inline-flex items-center gap-2 rounded-full border border-graphite bg-white/[0.04] px-3 py-1.5 text-[13px] text-mist"
            >
              <span className="size-1.5 shrink-0 rounded-full bg-acid-lime" />
              We&apos;re hiring
            </span>

            {hasRoles && (
              <p
                className="linear-mono text-[12px] text-fog lg:hidden"
                aria-live="polite"
              >
                {openRolesCount} {openRolesCount === 1 ? "role" : "roles"} live
              </p>
            )}
          </div>

          <div className="space-y-4 sm:space-y-5">
            <h1
              id="careers-hero-title"
              className="text-balance font-[510] leading-[1.08] tracking-[-0.022em] text-paper [font-size:clamp(2rem,5vw+0.75rem,3.25rem)]"
            >
              Open positions
            </h1>

            <p className="max-w-xl text-pretty text-[15px] leading-[1.65] text-fog sm:text-[17px] sm:leading-[1.7]">
              Explore roles that match your skills. Pick a job, upload your CV,
              and apply in a few minutes — we&apos;ll follow up by email.
            </p>
          </div>
        </div>

        {/* Actions + count — stacked card on mobile, right column on desktop */}
        <div className="flex flex-col gap-4 lg:col-span-5 lg:justify-end">
          {hasRoles ? (
            <div
              className="flex flex-col gap-4 rounded-xl border border-graphite bg-carbon p-5 shadow-[rgb(35,37,42)_0px_0px_0px_1px_inset] sm:p-6"
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-graphite bg-obsidian text-mist"
                  aria-hidden
                >
                  <Briefcase className="size-5" />
                </div>
                <div className="min-w-0">
                  <p
                    className="tabular-nums text-[32px] font-[510] leading-none tracking-[-0.02em] text-paper sm:text-[40px]"
                    aria-label={`${openRolesCount} ${positionsLabel.toLowerCase()}`}
                  >
                    {openRolesCount}
                  </p>
                  <p className="mt-1 text-[13px] text-fog">{positionsLabel}</p>
                  <p className="mt-0.5 text-[12px] text-fog/80">
                    Available to apply now
                  </p>
                </div>
              </div>

              <Link
                href="/jobs"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full justify-center"
                )}
              >
                View open roles
                <ArrowRight className="size-4" aria-hidden />
              </Link>

              <p className="text-center text-[12px] leading-relaxed text-fog sm:text-[13px]">
                PDF CV · Apply in minutes · Free to apply
              </p>
            </div>
          ) : (
            <div
              className="rounded-xl border border-graphite bg-carbon p-5 sm:p-6 shadow-[rgb(35,37,42)_0px_0px_0px_1px_inset]"
            >
              <p className="text-[15px] leading-relaxed text-mist">
                No roles are open right now. New positions are listed here when
                they&apos;re published.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
