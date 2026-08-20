"use client";

import { useState } from "react";
import { applyToJobBySlug } from "@/lib/applications/public-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-lg font-normal">
            Application received
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Thank you for applying to <strong className="text-foreground">{jobTitle}</strong>.
          </p>
          <p>
            Your CV has been uploaded and AI screening will begin shortly. A recruiter
            will review the results — this is not an automatic hiring decision.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-mono text-lg font-normal">Apply for this role</CardTitle>
        <p className="text-sm text-muted-foreground">
          Submit your details and CV. PDF or image files up to 10 MB.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" required autoComplete="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">CV (PDF or image)</Label>
            <Input
              id="file"
              name="file"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Submitting…" : "Submit application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
