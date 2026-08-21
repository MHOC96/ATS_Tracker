"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { archiveJob, closeJob, deleteJob } from "@/lib/jobs/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type JobManageActionsProps = {
  jobId: string;
  status: string;
  applicationCount?: number;
  canManage: boolean;
};

export function JobManageActions({
  jobId,
  status,
  applicationCount = 0,
  canManage,
}: JobManageActionsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"close" | "archive" | "delete" | null>(null);

  if (!canManage || status === "ARCHIVED") {
    return null;
  }

  const canDeleteDraft = status === "DRAFT" && applicationCount === 0;

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

  async function handleDelete() {
    if (
      !confirm(
        "Permanently delete this draft job? This cannot be undone."
      )
    ) {
      return;
    }

    setLoading("delete");
    setError(null);

    const result = await deleteJob({ jobId });

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
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {status === "PUBLISHED" && (
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={loading !== null}
            onClick={handleClose}
          >
            {loading === "close" ? "Closing…" : "Close job"}
          </Button>
        )}

        <Button
          type="button"
          variant="destructive"
          className="w-full sm:w-auto"
          disabled={loading !== null}
          onClick={handleArchive}
        >
          {loading === "archive" ? "Archiving…" : "Archive job"}
        </Button>

        {canDeleteDraft && (
          <Button
            type="button"
            variant="destructive"
            className="w-full sm:w-auto"
            disabled={loading !== null}
            onClick={handleDelete}
          >
            {loading === "delete" ? "Deleting…" : "Delete draft"}
          </Button>
        )}

        {error && (
          <p className="w-full text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
