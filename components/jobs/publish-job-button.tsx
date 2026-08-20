"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { publishJob } from "@/lib/jobs/actions";
import { Button } from "@/components/ui/button";

type PublishJobButtonProps = {
  jobId: string;
};

export function PublishJobButton({ jobId }: PublishJobButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePublish() {
    setLoading(true);
    setError(null);

    const result = await publishJob({ jobId });

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <div className="space-y-2">
      <Button onClick={handlePublish} disabled={loading}>
        {loading ? "Publishing…" : "Publish job"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
