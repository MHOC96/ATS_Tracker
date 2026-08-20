import Link from "next/link";
import { Briefcase } from "lucide-react";

export function PublicHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-mono text-sm tracking-tight">
          <Briefcase className="size-4" />
          Careers
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/jobs" className="text-muted-foreground hover:text-foreground">
            Open roles
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-border px-3 py-1.5 text-muted-foreground hover:text-foreground"
          >
            Admin login
          </Link>
        </nav>
      </div>
    </header>
  );
}
