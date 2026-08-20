import type { PublicJob } from "@/lib/jobs/queries";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatJobType(jobType: string) {
  return jobType.replace(/_/g, " ");
}

type JobPublicViewProps = {
  job: PublicJob;
};

export function JobPublicView({ job }: JobPublicViewProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Badge variant="outline">{formatJobType(job.jobType)}</Badge>
        <h1 className="font-mono text-3xl tracking-tight">{job.title}</h1>
        {job.publishedAt && (
          <p className="text-xs text-muted-foreground">
            Posted {new Date(job.publishedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-lg font-normal">About the role</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-sm text-muted-foreground">
          {job.description ? (
            <p className="whitespace-pre-wrap">{job.description}</p>
          ) : (
            <p>No description provided.</p>
          )}

          {job.responsibilities && (
            <div>
              <p className="font-medium text-foreground">Responsibilities</p>
              <p className="mt-1 whitespace-pre-wrap">{job.responsibilities}</p>
            </div>
          )}

          {job.requirements && (
            <div>
              <p className="font-medium text-foreground">Requirements</p>
              <p className="mt-1 whitespace-pre-wrap">{job.requirements}</p>
            </div>
          )}

          {job.requiredSkills.length > 0 && (
            <div>
              <p className="font-medium text-foreground">Required skills</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {job.requiredSkills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {job.preferredSkills.length > 0 && (
            <div>
              <p className="font-medium text-foreground">Preferred skills</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {job.preferredSkills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
