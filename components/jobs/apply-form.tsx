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
};

export function ApplyForm({ jobSlug, jobTitle }: ApplyFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await applyToJobBySlug(jobSlug, formData);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="space-y-3 border-b border-graphite px-5 py-6 sm:px-7 sm:py-7">
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
        <CardContent className="px-5 pb-6 pt-6 sm:px-7 sm:pb-7 sm:pt-7">
          <p className="text-[15px] leading-relaxed text-fog">
            We&apos;ve received your application. Our hiring team will review it
            and contact you if your profile matches what we&apos;re looking for.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="space-y-3 border-b border-graphite px-5 py-6 sm:px-7 sm:py-7">
        <CardTitle className="text-[17px] sm:text-[18px]">Apply for this role</CardTitle>
        <p className="text-[14px] leading-relaxed text-fog">
          Submit your details and CV. PDF only, up to 4&nbsp;MB.
        </p>
        <p className="text-[13px] leading-snug text-fog/90">
          Applying for{" "}
          <span className="font-[510] text-mist">{jobTitle}</span>
        </p>
      </CardHeader>

      <CardContent className="px-5 pb-6 pt-6 sm:px-7 sm:pb-7 sm:pt-7">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <div className="space-y-2.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                name="fullName"
                required
                autoComplete="name"
                placeholder="Your full name"
                className="h-11 text-[15px] sm:h-12"
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="h-11 text-[15px] sm:h-12"
              />
              <p className="text-[12px] leading-relaxed text-fog">
                We&apos;ll use this to contact you about your application.
              </p>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="file">Your CV</Label>
              <div
                className={cn(
                  "rounded-lg border border-dashed border-graphite bg-obsidian/50 p-4 transition-colors",
                  "focus-within:border-mist/40"
                )}
              >
                <div className="mb-3 flex items-center gap-2 text-fog">
                  <FileText className="size-4 shrink-0" aria-hidden />
                  <span className="text-[12px]">PDF format, maximum 4&nbsp;MB</span>
                </div>
                <Input
                  id="file"
                  name="file"
                  type="file"
                  accept=".pdf,application/pdf"
                  required
                  className={cn(
                    "h-auto min-h-11 w-full border-0 bg-transparent px-0 py-2 text-[14px] file:mr-4 file:rounded-md file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-[13px] file:font-[510] file:text-mist hover:file:bg-white/15"
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

          <div className="space-y-3 border-t border-graphite pt-6">
            <Button
              type="submit"
              className="h-11 w-full text-[15px] sm:h-12"
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
