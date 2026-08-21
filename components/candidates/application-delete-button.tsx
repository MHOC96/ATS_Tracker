"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCandidateApplication } from "@/lib/candidates/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ApplicationDeleteButtonProps = {
  applicationId: string;
  redirectTo?: string;
  variant?: "card" | "inline";
  canDelete: boolean;
};

export function ApplicationDeleteButton({
  applicationId,
  redirectTo = "/admin/candidates",
  variant = "card",
  canDelete,
}: ApplicationDeleteButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!canDelete) return null;

  async function handleDelete() {
    if (
      !confirm(
        "Permanently delete this application and all related scores and decisions? This cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    const result = await deleteCandidateApplication({ applicationId });

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  if (variant === "inline") {
    return (
      <div className="flex flex-col gap-1">
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={loading}
          onClick={handleDelete}
        >
          {loading ? "Deleting…" : "Delete"}
        </Button>
        {error && (
          <p className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-mono text-lg font-normal">Delete application</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Permanently removes this application from the system. The CV file remains in
          Google Drive.
        </p>
        <Button
          type="button"
          variant="destructive"
          className="w-full sm:w-auto"
          disabled={loading}
          onClick={handleDelete}
        >
          {loading ? "Deleting…" : "Delete application"}
        </Button>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
