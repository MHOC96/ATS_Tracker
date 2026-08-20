"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadCvForJob } from "@/lib/applications/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type UploadCvFormProps = {
  jobId: string;
  jobTitle: string;
};

export function UploadCvForm({ jobId, jobTitle }: UploadCvFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await uploadCvForJob(jobId, formData);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.refresh();
    event.currentTarget.reset();
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-mono text-lg font-normal">Upload CV</CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload a candidate CV for {jobTitle}. File goes to Incoming_CVs and AI
          processing is queued on the worker.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Candidate name (optional)</Label>
              <Input id="fullName" name="fullName" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input id="email" name="email" type="email" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">CV file (PDF or image)</Label>
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
            {loading ? "Uploading…" : "Upload and queue screening"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
