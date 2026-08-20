import { PublicHeader } from "@/components/public/public-header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">{children}</div>
      </main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        AI-assisted recruitment — human review for all hiring decisions.
      </footer>
    </div>
  );
}
