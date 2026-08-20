import Link from "next/link";
import { Briefcase } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-4 sm:py-4 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 font-mono text-sm tracking-tight"
        >
          <Briefcase className="size-4 shrink-0" />
          <span className="truncate">Careers</span>
        </Link>
        <nav className="flex shrink-0 items-center gap-2 text-xs sm:gap-4 sm:text-sm">
          <Link
            href="/jobs"
            className="whitespace-nowrap text-muted-foreground hover:text-foreground"
          >
            Open roles
          </Link>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-8 px-2.5 text-xs sm:h-9 sm:px-3 sm:text-sm"
            )}
          >
            Admin login
          </Link>
        </nav>
      </div>
    </header>
  );
}
