"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveAdminDecision } from "@/lib/candidates/actions";
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

type DecisionFormProps = {
  applicationId: string;
  canDecide: boolean;
};

const decisions = [
  { value: "SHORTLIST", label: "Shortlist" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "HOLD", label: "Hold" },
  { value: "REJECT", label: "Reject" },
  { value: "MANUAL_REVIEW", label: "Manual review" },
] as const;

export function DecisionForm({ applicationId, canDecide }: DecisionFormProps) {
  const router = useRouter();
  const [decision, setDecision] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

    if (!decision) {
      setError("Select a decision");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await saveAdminDecision({
      applicationId,
      decision: decision as (typeof decisions)[number]["value"],
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
    setDecision("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recruiter decision</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="decision">Decision</Label>
            <Select
              value={decision}
              onValueChange={(value) => setDecision(value ?? "")}
            >
              <SelectTrigger id="decision" className="w-full">
                <SelectValue placeholder="Select decision" />
              </SelectTrigger>
              <SelectContent>
                {decisions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
            {loading ? "Saving…" : "Save decision"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
