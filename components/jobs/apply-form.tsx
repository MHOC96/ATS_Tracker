"use client";

import { useState } from "react";
import { FileText, CheckCircle2 } from "lucide-react";
import { applyToJobBySlug } from "@/lib/applications/public-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ApplyFormProps = {
  jobSlug: string;
  jobTitle: string;
  layout?: "default" | "sidebar";
};

export function ApplyForm({
  jobSlug,
  jobTitle,
  layout = "default",
}: ApplyFormProps) {
  const isSidebar = layout === "sidebar";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const result = await applyToJobBySlug(jobSlug, formData);

      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setLoading(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <Card
        className={cn(
          "gap-0 overflow-hidden p-0",
          isSidebar &&
            "lg:rounded-xl lg:border-graphite/80 lg:shadow-[0_8px_24px_rgb(0,0,0,0.28)] lg:ring-1 lg:ring-white/[0.04]"
        )}
      >
        <CardHeader className="space-y-2 border-b border-graphite px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-pulse-green" aria-hidden />
            <div className="space-y-1">
              <CardTitle>Application received</CardTitle>
              <p className="text-[13px] leading-relaxed text-fog">
                Thank you for applying to{" "}
                <span className="text-mist">{jobTitle}</span>.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-5 pt-4 sm:px-5 sm:pb-5 sm:pt-5">
          <p className="text-[14px] leading-relaxed text-fog">
            We&apos;ve received your application. Our hiring team will review it
            and contact you if your profile matches what we&apos;re looking for.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "min-w-0 gap-0 overflow-hidden p-0",
        isSidebar &&
          "lg:rounded-xl lg:border-graphite/80 lg:shadow-[0_8px_24px_rgb(0,0,0,0.28)] lg:ring-1 lg:ring-white/[0.04]"
      )}
    >
      <CardHeader
        className={cn(
          "space-y-2 border-b border-graphite px-4 py-4 sm:px-5 sm:py-5"
        )}
      >
        <CardTitle className="text-[16px] sm:text-[17px]">
          Apply for this role
        </CardTitle>
        <p className="text-[14px] leading-relaxed text-fog">
          Submit your details and CV. PDF only, up to 4&nbsp;MB.
        </p>
        <p
          className={cn(
            "text-[13px] leading-snug text-fog/90",
            isSidebar && "lg:hidden"
          )}
        >
          Applying for{" "}
          <span className="font-[510] text-mist">{jobTitle}</span>
        </p>
      </CardHeader>

      <CardContent className="px-4 pb-5 pt-4 sm:px-5 sm:pb-5 sm:pt-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                name="fullName"
                required
                autoComplete="name"
                placeholder="Your full name"
                className="h-10 text-[14px] sm:h-11 sm:text-[15px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="h-10 text-[14px] sm:h-11 sm:text-[15px]"
              />
              <p className="text-[12px] leading-relaxed text-fog">
                We&apos;ll use this to contact you about your application.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Your CV</Label>
              <div
                className={cn(
                  "min-w-0 max-w-full overflow-hidden rounded-lg border border-dashed border-graphite bg-obsidian/50 p-2.5 sm:p-3 transition-colors",
                  "focus-within:border-mist/40"
                )}
              >
                <div className="mb-2 flex min-w-0 items-center gap-2 text-fog">
                  <FileText className="size-4 shrink-0" aria-hidden />
                  <span className="min-w-0 text-[12px] leading-snug">
                    PDF format, maximum 4&nbsp;MB
                  </span>
                </div>
                <Input
                  id="file"
                  name="file"
                  type="file"
                  accept=".pdf,application/pdf"
                  required
                  className={cn(
                    "block h-auto min-h-11 w-full min-w-0 max-w-full overflow-hidden border-0 bg-transparent px-0 py-2 text-[13px] sm:text-[14px]",
                    "file:mr-0 file:mb-2 file:block file:max-w-full file:truncate file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-[12px] file:font-[510] file:text-mist sm:file:mr-4 sm:file:mb-0 sm:file:inline sm:file:max-w-none sm:file:px-4 sm:file:text-[13px] hover:file:bg-white/15"
                  )}
                />
              </div>
            </div>
          </div>

          {error && (
            <p
              className="rounded-md border border-coral-red/30 bg-coral-red/10 px-3 py-2.5 text-[13px] leading-relaxed text-coral-red"
              role="alert"
            >
              {error}
            </p>
          )}

          <div className="space-y-2.5 border-t border-graphite pt-4">
            <Button
              type="submit"
              className="h-10 w-full text-[14px] sm:h-11 sm:text-[15px]"
              disabled={loading}
            >
              {loading ? "Submitting…" : "Submit application"}
            </Button>
            <p className="text-center text-[12px] leading-relaxed text-fog">
              By applying, you agree we may store your details for this
              recruitment process.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
