import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { JobManageActions } from "@/components/jobs/job-manage-actions";
import { JobPublicPreview } from "@/components/jobs/job-public-preview";
import { PublishJobButton } from "@/components/jobs/publish-job-button";
import { UploadCvForm } from "@/components/jobs/upload-cv-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

type JobDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const user = await requireSessionUser();
  const supabase = await createClient();

  const { data: job, error } = await supabase
    .from("jobs")
    .select(
      "id, title, slug, job_type, status, description, responsibilities, requirements, required_skills, preferred_skills, published_at"
    )
    .eq("id", id)
    .single();

  if (error || !job) notFound();

  const { data: applications } = await supabase
    .from("candidate_applications")
    .select("id, status, applied_at, candidates(full_name, email)")
    .eq("job_id", id)
    .order("applied_at", { ascending: false });

  const canUpload = user.role !== "REVIEWER" && job.status === "PUBLISHED";
  const canPublish = user.role === "ADMIN" && job.status === "DRAFT";
  const canEdit = user.role === "ADMIN" && job.status !== "ARCHIVED";
  const canManage = user.role === "ADMIN" && job.status !== "ARCHIVED";
  const showPublicPreview = job.status === "DRAFT" || job.status === "PUBLISHED";

  const publicJob = {
    id: job.id,
    title: job.title,
    slug: job.slug,
    jobType: job.job_type,
    description: job.description,
    responsibilities: job.responsibilities,
    requirements: job.requirements,
    requiredSkills: job.required_skills ?? [],
    preferredSkills: job.preferred_skills ?? [],
    publishedAt: job.published_at,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl tracking-tight">{job.title}</h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            {job.slug} · {job.job_type.replace(/_/g, " ")}
          </p>
        </div>
        <Badge variant="outline">{job.status}</Badge>
      </div>

      {canPublish && <PublishJobButton jobId={job.id} />}

      {canEdit && (
        <Link
          href={`/admin/jobs/${job.id}/edit`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Edit job
        </Link>
      )}

      {showPublicPreview && (
        <JobPublicPreview job={publicJob} isDraft={job.status === "DRAFT"} />
      )}

      {job.status === "PUBLISHED" && (
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/jobs/${job.slug}`}
            target="_blank"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            View public page
          </Link>
          <p className="text-xs text-muted-foreground">
            Candidates apply at /jobs/{job.slug}
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-lg font-normal">Job description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          {job.description && <p>{job.description}</p>}
          {job.responsibilities && (
            <div>
              <p className="font-medium text-foreground">Responsibilities</p>
              <p>{job.responsibilities}</p>
            </div>
          )}
          {job.requirements && (
            <div>
              <p className="font-medium text-foreground">Requirements</p>
              <p>{job.requirements}</p>
            </div>
          )}
          {job.required_skills?.length > 0 && (
            <p>
              <span className="font-medium text-foreground">Required: </span>
              {job.required_skills.join(", ")}
            </p>
          )}
        </CardContent>
      </Card>

      {canUpload && <UploadCvForm jobId={job.id} jobTitle={job.title} />}

      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-lg font-normal">Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {!applications?.length ? (
            <p className="text-sm text-muted-foreground">No applications yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {applications.map((application) => {
                const candidate = application.candidates as unknown as {
                  full_name: string | null;
                  email: string | null;
                } | null;

                return (
                  <li
                    key={application.id}
                    className="flex items-center justify-between gap-4 py-3 text-sm"
                  >
                    <div>
                      <Link
                        href={`/admin/candidates/${application.id}`}
                        className="font-medium hover:underline"
                      >
                        {candidate?.full_name ?? "Unknown candidate"}
                      </Link>
                      <p className="text-muted-foreground">
                        {candidate?.email ?? "No email"}
                      </p>
                    </div>
                    <Badge variant="outline">{application.status}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {canManage && (
        <JobManageActions
          jobId={job.id}
          status={job.status}
          canManage={canManage}
        />
      )}
    </div>
  );
}
