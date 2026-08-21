"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCandidate } from "@/lib/candidates/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CandidateEditFormProps = {
  applicationId: string;
  initialFullName: string;
  initialEmail: string | null;
  initialPhone: string | null;
  initialLocation: string | null;
  canEdit: boolean;
  className?: string;
};

export function CandidateEditForm({
  applicationId,
  initialFullName,
  initialEmail,
  initialPhone,
  initialLocation,
  canEdit,
  className,
}: CandidateEditFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialFullName);
  const [email, setEmail] = useState(initialEmail ?? "");
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [location, setLocation] = useState(initialLocation ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!canEdit) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await updateCandidate({
      applicationId,
      fullName,
      email,
      phone,
      location,
    });

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <Card className={cn("min-w-0", className)}>
      <CardHeader>
        <CardTitle>Edit candidate</CardTitle>
      </CardHeader>
      <CardContent className="min-w-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="text-base sm:text-[14px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-base sm:text-[14px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="text-base sm:text-[14px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="text-base sm:text-[14px]"
            />
          </div>

          <p className="text-[12px] leading-relaxed text-fog">
            Use Recruiter outcome below to change pipeline status. That keeps a
            decision history with optional notes.
          </p>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
            {loading ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
