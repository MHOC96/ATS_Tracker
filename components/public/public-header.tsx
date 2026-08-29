import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-graphite/80 bg-void/90 backdrop-blur-md">
      <div className="linear-page flex min-w-0 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex min-h-10 min-w-0 flex-col justify-center gap-0.5 sm:min-h-11"
        >
          <span className="text-[15px] font-[510] tracking-[-0.011em] text-paper sm:text-[16px]">
            Careers
          </span>
          <span className="hidden text-[11px] text-fog sm:block">Join our team</span>
        </Link>

        <nav className="flex shrink-0 items-center gap-2">
          <Link
            href="/jobs"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-9 px-3.5 text-[12px] sm:h-10 sm:px-4 sm:text-[13px]"
            )}
          >
            Open roles
          </Link>
        </nav>
      </div>
    </header>
  );
}
