"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { sendInterviewInvite } from "@/lib/candidates/actions";
import {
  interviewTypeOptions,
  type InterviewTypeValue,
} from "@/packages/shared/schemas/interview";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type InterviewInviteModalProps = {
  applicationId: string;
  candidateName: string;
  candidateEmail: string | null;
  jobTitle: string;
  canDecide: boolean;
};

export function InterviewInviteModal({
  applicationId,
  candidateName,
  candidateEmail,
  jobTitle,
  canDecide,
}: InterviewInviteModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [interviewType, setInterviewType] = useState<InterviewTypeValue | "">(
    ""
  );
  const [instructions, setInstructions] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!canDecide) {
    return null;
  }

  const hasEmail = Boolean(candidateEmail?.trim());

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!interviewType) {
      setError("Select an interview type and duration");
      return;
    }

    if (!hasEmail) {
      setError("Candidate email is required to send an interview invite");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await sendInterviewInvite({
      applicationId,
      interviewType,
      instructions: instructions.trim() || undefined,
    });

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setOpen(false);
    setInterviewType("");
    setInstructions("");
    setLoading(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={!hasEmail}
          />
        }
      >
        <CalendarClock className="size-4" aria-hidden />
        Select for Interview
      </DialogTrigger>
      <DialogContent className="max-h-[min(90vh,640px)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select for Interview</DialogTitle>
          <DialogDescription>
            Send {candidateName || "the candidate"} a congratulatory email with
            your Cal.com booking link for {jobTitle}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
            <p>
              <span className="text-muted-foreground">To: </span>
              {candidateEmail ?? "No email on file"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interview-type">Interview type &amp; duration</Label>
            <Select
              value={interviewType}
              onValueChange={(value) =>
                setInterviewType((value as InterviewTypeValue | null) ?? "")
              }
            >
              <SelectTrigger id="interview-type" className="h-10 w-full">
                <SelectValue placeholder="Select session format" />
              </SelectTrigger>
              <SelectContent>
                {interviewTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interview-instructions">
              Instructions / note for candidate (optional)
            </Label>
            <Textarea
              id="interview-instructions"
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              placeholder='e.g. "Please have a stable internet connection and your GitHub projects ready to share."'
              className="min-h-24 resize-y"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !hasEmail}>
              {loading ? "Sending…" : "Send Interview Invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
