import type { Metadata } from "next";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { PUBLIC_APP_NAME } from "@/lib/constants/branding";

export const metadata: Metadata = {
  title: {
    default: PUBLIC_APP_NAME,
    template: `%s — ${PUBLIC_APP_NAME}`,
  },
  description: "Browse open positions and apply online.",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-hidden bg-void">
      <PublicHeader />
      <main className="min-w-0 flex-1 overflow-x-hidden">
        <div className="linear-page min-w-0 px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
      <footer className="mt-auto">
        <PublicFooter />
      </footer>
    </div>
  );
}
