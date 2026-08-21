"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveAdminDecision } from "@/lib/candidates/actions";
import {
  recruiterOutcomeOptions,
  type RecruiterOutcomeStatus,
} from "@/packages/shared/schemas";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DecisionFormProps = {
  applicationId: string;
  canDecide: boolean;
  className?: string;
};

export function DecisionForm({
  applicationId,
  canDecide,
  className,
}: DecisionFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<RecruiterOutcomeStatus | "">("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedOption = recruiterOutcomeOptions.find(
    (item) => item.value === status
  );

  if (!canDecide) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          Reviewers can view scores but cannot record hiring decisions.
        </CardContent>
      </Card>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!status) {
      setError("Select a recruiter outcome");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await saveAdminDecision({
      applicationId,
      status,
      notes,
    });

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
    setNotes("");
    setStatus("");
  }

  return (
    <Card className={cn("min-w-0", className)}>
      <CardHeader>
        <CardTitle>Recruiter outcome</CardTitle>
      </CardHeader>
      <CardContent className="min-w-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="decision-status">Outcome</Label>
            <Select
              value={status}
              onValueChange={(value) =>
                setStatus((value as RecruiterOutcomeStatus | null) ?? "")
              }
            >
              <SelectTrigger id="decision-status" className="h-10 w-full min-w-0">
                <SelectValue placeholder="Select outcome" />
              </SelectTrigger>
              <SelectContent>
                {recruiterOutcomeOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedOption && (
              <p className="text-[12px] leading-relaxed text-fog">
                {selectedOption.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-24 w-full min-w-0 resize-y text-base sm:text-[14px]"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
            {loading ? "Saving…" : "Save outcome"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
