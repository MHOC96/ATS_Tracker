import Link from "next/link";
import { ApplicationRowActions } from "@/components/candidates/application-row-actions";
import { ApplicationPipelineBadges } from "@/components/candidates/application-status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CandidateApplicationListItem } from "@/lib/candidates/queries";

type CandidatesTableProps = {
  applications: CandidateApplicationListItem[];
  emptyMessage?: string;
  showActions?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  deleteRedirectTo?: string;
};

function ApplicationRowMain({
  application,
  linked,
}: {
  application: CandidateApplicationListItem;
  linked: boolean;
}) {
  const content = (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <p className="min-w-0 break-words font-medium">
          {application.candidateName}
        </p>
        <ApplicationPipelineBadges
          variant="compact"
          status={application.status}
          hasAiScore={application.finalScore !== null}
        />
      </div>
      <p className="mt-1 break-all text-sm text-muted-foreground">
        {application.jobTitle}
        {application.candidateEmail ? ` · ${application.candidateEmail}` : ""}
      </p>
    </div>
  );

  if (linked) {
    return (
      <Link
        href={`/admin/candidates/${application.id}`}
        className="min-w-0 flex-1 transition-opacity hover:opacity-80"
      >
        {content}
      </Link>
    );
  }

  return content;
}

export function CandidatesTable({
  applications,
  emptyMessage = "No applications found.",
  showActions = false,
  canEdit = false,
  canDelete = false,
  deleteRedirectTo,
}: CandidatesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Applications</CardTitle>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <ul className="divide-y divide-graphite">
            {applications.map((application) => (
              <li
                key={application.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
              >
                <ApplicationRowMain
                  application={application}
                  linked={!showActions}
                />
                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                  {application.finalScore !== null && (
                    <span className="font-mono text-sm">
                      {Math.round(application.finalScore)}%
                    </span>
                  )}
                  {application.recommendation && (
                    <Badge
                      variant="secondary"
                      className="max-w-full whitespace-normal sm:whitespace-nowrap"
                    >
                      {application.recommendation.replace(/_/g, " ")}
                    </Badge>
                  )}
                  {showActions && (
                    <ApplicationRowActions
                      applicationId={application.id}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      redirectAfterDelete={deleteRedirectTo}
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
