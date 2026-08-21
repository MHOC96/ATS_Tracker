"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { archiveJob, deleteJob } from "@/lib/jobs/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type JobRowActionsProps = {
  jobId: string;
  status: string;
  applicationCount: number;
  canManage: boolean;
};

export function JobRowActions({
  jobId,
  status,
  applicationCount,
  canManage,
}: JobRowActionsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"archive" | "delete" | null>(null);

  if (!canManage) return null;

  const canEdit = status !== "ARCHIVED";
  const canDelete =
    (status === "DRAFT" && applicationCount === 0) || status === "ARCHIVED";
  const canArchive = status !== "ARCHIVED";

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

    router.refresh();
    setLoading(null);
  }

  async function handleDelete() {
    const message =
      status === "ARCHIVED"
        ? applicationCount > 0
          ? `Permanently delete this archived job and all ${applicationCount} application record(s)? CV files remain in Google Drive. This cannot be undone.`
          : "Permanently delete this archived job? This cannot be undone."
        : "Permanently delete this draft job? This cannot be undone.";

    if (!confirm(message)) {
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

    router.refresh();
    setLoading(null);
  }

  const actionClass = "w-full justify-center sm:w-auto";

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
      <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
        <Link
          href={`/admin/jobs/${jobId}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), actionClass)}
        >
          View
        </Link>
        {canEdit && (
          <Link
            href={`/admin/jobs/${jobId}/edit`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), actionClass)}
          >
            Edit
          </Link>
        )}
        {canArchive && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={actionClass}
            disabled={loading !== null}
            onClick={handleArchive}
          >
            {loading === "archive" ? "Archiving…" : "Archive"}
          </Button>
        )}
        {canDelete && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className={actionClass}
            disabled={loading !== null}
            onClick={handleDelete}
          >
            {loading === "delete" ? "Deleting…" : "Delete"}
          </Button>
        )}
      </div>
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
