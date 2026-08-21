import Link from "next/link";
import { notFound } from "next/navigation";
import { CandidateEditForm } from "@/components/candidates/candidate-edit-form";
import { ApplicationDeleteButton } from "@/components/candidates/application-delete-button";
import { DecisionForm } from "@/components/candidates/decision-form";
import { ScoreSummary } from "@/components/candidates/score-summary";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSessionUser } from "@/lib/auth/session";
import { getCandidateApplicationDetail } from "@/lib/candidates/queries";
import { cn } from "@/lib/utils";

type CandidateDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CandidateDetailPage({
  params,
}: CandidateDetailPageProps) {
  const { id } = await params;
  const user = await requireSessionUser();
  const application = await getCandidateApplicationDetail(id);

  if (!application) notFound();

  const canDecide = user.role !== "REVIEWER";
  const canEdit = user.role !== "REVIEWER";
  const canDelete = user.role === "ADMIN";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/candidates"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "mb-3 self-start min-h-10"
            )}
          >
            ← Back to candidates
          </Link>
          <h1 className="break-words text-[24px] font-[510] tracking-[-0.012em] text-paper sm:text-[32px]">
            {application.candidate.fullName ?? "Unknown candidate"}
          </h1>
          <p className="mt-2 break-words text-[13px] text-fog">
            {application.job.title} · Applied{" "}
            {new Date(application.appliedAt).toLocaleDateString()}
          </p>
        </div>
        <Badge variant="outline">{application.status}</Badge>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_min(100%,360px)]">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>
                Candidate profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                <span className="text-muted-foreground">Email: </span>
                {application.candidate.email ?? "Not provided"}
              </p>
              {application.candidate.phone && (
                <p>
                  <span className="text-muted-foreground">Phone: </span>
                  {application.candidate.phone}
                </p>
              )}
              {application.candidate.location && (
                <p>
                  <span className="text-muted-foreground">Location: </span>
                  {application.candidate.location}
                </p>
              )}
              {application.profile && (
                <>
                  {application.profile.degree && (
                    <p>
                      <span className="text-muted-foreground">Education: </span>
                      {application.profile.degree}
                      {application.profile.university
                        ? `, ${application.profile.university}`
                        : ""}
                    </p>
                  )}
                  {application.profile.yearsExperience !== null && (
                    <p>
                      <span className="text-muted-foreground">Experience: </span>
                      {application.profile.yearsExperience} years
                    </p>
                  )}
                  {application.profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {application.profile.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </>
              )}
              {application.driveFileUrl && (
                <p className="pt-2">
                  <a
                    href={application.driveFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline underline-offset-4"
                  >
                    View CV in Google Drive
                  </a>
                </p>
              )}
            </CardContent>
          </Card>

          {application.score ? (
            <ScoreSummary score={application.score} />
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                AI screening has not completed yet. Check back after the worker
                processes this application.
              </CardContent>
            </Card>
          )}

          {application.latestDecision && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Latest decision
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Badge variant="outline">
                  {application.latestDecision.decision.replace(/_/g, " ")}
                </Badge>
                {application.latestDecision.notes && (
                  <p className="text-muted-foreground">
                    {application.latestDecision.notes}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(application.latestDecision.createdAt).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:sticky lg:top-8 lg:self-start space-y-8">
          <CandidateEditForm
            applicationId={application.id}
            initialFullName={application.candidate.fullName ?? ""}
            initialEmail={application.candidate.email}
            initialPhone={application.candidate.phone}
            initialLocation={application.candidate.location}
            initialStatus={application.status}
            canEdit={canEdit}
          />
          <DecisionForm applicationId={application.id} canDecide={canDecide} />
          <ApplicationDeleteButton
            applicationId={application.id}
            canDelete={canDelete}
          />
        </div>
      </div>
    </div>
  );
}
