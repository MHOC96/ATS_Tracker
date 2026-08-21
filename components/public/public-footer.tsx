import Link from "next/link";
import { cn } from "@/lib/utils";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/jobs", label: "Open roles" },
] as const;

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-graphite bg-carbon/40">
      <div className="linear-page min-w-0 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0 text-center sm:text-left">
            <Link
              href="/"
              className="inline-block text-[15px] font-[510] tracking-[-0.011em] text-paper transition-colors hover:text-mist"
            >
              Careers
            </Link>
            <p className="mt-1 text-[13px] text-fog">
              Find your next role and apply online.
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 sm:justify-end"
          >
            {footerLinks.map((link, index) => (
              <span key={link.href} className="inline-flex items-center">
                {index > 0 && (
                  <span className="mx-2 text-fog/40 select-none" aria-hidden>
                    ·
                  </span>
                )}
                <Link
                  href={link.href}
                  className={cn(
                    "inline-flex min-h-9 items-center px-2 text-[13px] text-mist transition-colors",
                    "rounded-md hover:bg-white/[0.04] hover:text-paper"
                  )}
                >
                  {link.label}
                </Link>
              </span>
            ))}
          </nav>
        </div>

        <div className="mt-5 border-t border-graphite/70 pt-4 text-center sm:text-left">
          <p className="text-[12px] text-fog/90">© {year} mhoc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
