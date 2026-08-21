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
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge variant="outline">{formatJobType(job.jobType)}</Badge>
        <h1 className="linear-heading text-[28px] sm:text-[40px] lg:text-[48px]">
          {job.title}
        </h1>
        {job.publishedAt && (
          <p className="linear-mono text-fog">
            Posted {new Date(job.publishedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About the role</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-[15px] leading-relaxed text-fog">
          {job.description ? (
            <p className="whitespace-pre-wrap break-words text-mist">{job.description}</p>
          ) : (
            <p>No description provided.</p>
          )}

          {job.responsibilities && (
            <div>
              <p className="text-[13px] font-[510] text-paper">Responsibilities</p>
              <p className="mt-2 whitespace-pre-wrap break-words">{job.responsibilities}</p>
            </div>
          )}

          {job.requirements && (
            <div>
              <p className="text-[13px] font-[510] text-paper">Requirements</p>
              <p className="mt-2 whitespace-pre-wrap break-words">{job.requirements}</p>
            </div>
          )}

          {job.requiredSkills.length > 0 && (
            <div>
              <p className="text-[13px] font-[510] text-paper">Required skills</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {job.requiredSkills.map((skill) => (
                  <Badge key={skill} variant="tag">{skill}</Badge>
                ))}
              </div>
            </div>
          )}

          {job.preferredSkills.length > 0 && (
            <div>
              <p className="text-[13px] font-[510] text-paper">Preferred skills</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {job.preferredSkills.map((skill) => (
                  <Badge key={skill} variant="outline">{skill}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
