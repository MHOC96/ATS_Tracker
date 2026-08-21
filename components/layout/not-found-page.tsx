import Link from "next/link";
import { ArrowLeft, Home, SearchX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NotFoundPageProps = {
  title?: string;
  description?: string;
  homeHref?: string;
  homeLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  fullPage?: boolean;
};

export function NotFoundPage({
  title = "Page not found",
  description = "The page you are looking for does not exist, was moved, or is no longer available.",
  homeHref = "/",
  homeLabel = "Back to home",
  secondaryHref,
  secondaryLabel,
  fullPage = false,
}: NotFoundPageProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-4 text-center",
        fullPage ? "min-h-screen py-12" : "py-16 sm:py-24"
      )}
    >
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="mb-6 flex size-14 items-center justify-center rounded-md border border-graphite bg-obsidian sm:size-16">
          <SearchX className="size-6 text-fog sm:size-7" aria-hidden />
        </div>

        <p className="linear-mono text-fog uppercase tracking-wider">404</p>
        <h1 className="mt-3 text-[24px] font-[510] tracking-[-0.012em] text-paper sm:text-[32px]">
          {title}
        </h1>
        <p className="mt-3 text-[13px] leading-relaxed text-fog sm:text-[15px]">
          {description}
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
          <Link href={homeHref} className={cn(buttonVariants(), "w-full sm:w-auto")}>
            <Home className="size-4" />
            {homeLabel}
          </Link>
          {secondaryHref && secondaryLabel && (
            <Link
              href={secondaryHref}
              className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}
            >
              <ArrowLeft className="size-4" />
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
