"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { archiveJob, closeJob } from "@/lib/jobs/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type JobManageActionsProps = {
  jobId: string;
  status: string;
  canManage: boolean;
};

export function JobManageActions({
  jobId,
  status,
  canManage,
}: JobManageActionsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"close" | "archive" | null>(null);

  if (!canManage || status === "ARCHIVED") {
    return null;
  }

  async function handleClose() {
    if (!confirm("Close this job? New applications will be disabled.")) return;

    setLoading("close");
    setError(null);

    const result = await closeJob({ jobId });

    if (!result.success) {
      setError(result.error);
      setLoading(null);
      return;
    }

    router.refresh();
    setLoading(null);
  }

  async function handleArchive() {
    if (
      !confirm(
        "Archive this job? It will be removed from public listings and cannot be edited."
      )
    ) {
      return;
    }

    setLoading("archive");
    setError(null);

    const result = await archiveJob({ jobId });

    if (!result.success) {
      setError(result.error);
      setLoading(null);
      return;
    }

    router.push("/admin/jobs");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-mono text-lg font-normal">Manage job</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        {status === "PUBLISHED" && (
          <Button
            type="button"
            variant="outline"
            disabled={loading !== null}
            onClick={handleClose}
          >
            {loading === "close" ? "Closing…" : "Close job"}
          </Button>
        )}

        <Button
          type="button"
          variant="destructive"
          disabled={loading !== null}
          onClick={handleArchive}
        >
          {loading === "archive" ? "Archiving…" : "Archive job"}
        </Button>

        {error && (
          <p className="w-full text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
