import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/public-header";

export const metadata: Metadata = {
  title: {
    default: "Careers",
    template: "%s — Careers",
  },
  description: "Browse open positions and apply online.",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-void">
      <PublicHeader />
      <main className="flex-1">
        <div className="linear-page px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
          {children}
        </div>
      </main>
      <footer className="border-t border-graphite px-4 py-6 text-center linear-caption sm:px-6 sm:py-8">
        <p>Browse open roles and apply with your CV.</p>
        <p className="mt-2 text-fog/80">
          © {new Date().getFullYear()} mhoc
        </p>
      </footer>
    </div>
  );
}
