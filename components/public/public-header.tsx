import Link from "next/link";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-graphite/80 bg-void/95 backdrop-blur-sm">
      <div className="linear-page flex items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-[16px] font-[510] tracking-[-0.011em] text-paper"
        >
          Careers
        </Link>
        <nav className="flex shrink-0 items-center">
          <Link
            href="/jobs"
            className={cn(
              "inline-flex min-h-11 items-center rounded-md px-4 py-2.5 text-[13px] text-mist transition-colors",
              "hover:bg-white/5 hover:text-paper"
            )}
          >
            Open roles
          </Link>
        </nav>
      </div>
    </header>
  );
}
