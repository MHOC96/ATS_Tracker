import Link from "next/link";
import { ApplicationRowActions } from "@/components/candidates/application-row-actions";
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
        <CardTitle className="font-mono text-lg font-normal">Applications</CardTitle>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {applications.map((application) => (
              <li
                key={application.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="min-w-0 flex-1">
                  {showActions ? (
                    <>
                      <p className="break-words font-medium">
                        {application.candidateName}
                      </p>
                      <p className="break-words text-sm text-muted-foreground">
                        {application.jobTitle}
                        {application.candidateEmail
                          ? ` · ${application.candidateEmail}`
                          : ""}
                      </p>
                    </>
                  ) : (
                    <Link
                      href={`/admin/candidates/${application.id}`}
                      className="block transition-colors hover:opacity-80"
                    >
                      <p className="break-words font-medium">
                        {application.candidateName}
                      </p>
                      <p className="break-words text-sm text-muted-foreground">
                        {application.jobTitle}
                        {application.candidateEmail
                          ? ` · ${application.candidateEmail}`
                          : ""}
                      </p>
                    </Link>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end sm:gap-3">
                  {application.finalScore !== null && (
                    <span className="font-mono text-sm">
                      {Math.round(application.finalScore)}%
                    </span>
                  )}
                  {application.recommendation && (
                    <Badge variant="secondary">
                      {application.recommendation.replace(/_/g, " ")}
                    </Badge>
                  )}
                  <Badge variant="outline">{application.status}</Badge>
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
