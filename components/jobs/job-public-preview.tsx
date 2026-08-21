import type { PublicJob } from "@/lib/jobs/queries";
import { JobPublicView } from "@/components/jobs/job-public-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type JobPublicPreviewProps = {
  job: PublicJob;
  isDraft?: boolean;
};

export function JobPublicPreview({ job, isDraft = false }: JobPublicPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Public preview
        </CardTitle>
        {isDraft && (
          <p className="text-[13px] text-fog">
            This is how candidates will see the role after publish. Scoring and
            internal fields are never shown publicly.
          </p>
        )}
      </CardHeader>
      <CardContent className="rounded-lg border border-dashed border-graphite p-4 bg-void/50">
        <JobPublicView job={job} />
      </CardContent>
    </Card>
  );
}
