import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CandidateApplicationListItem } from "@/lib/candidates/queries";

type CandidatesTableProps = {
  applications: CandidateApplicationListItem[];
  emptyMessage?: string;
};

export function CandidatesTable({
  applications,
  emptyMessage = "No applications found.",
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
              <li key={application.id}>
                <Link
                  href={`/admin/candidates/${application.id}`}
                  className="flex flex-wrap items-center justify-between gap-4 py-4 transition-colors hover:bg-muted/40 -mx-2 px-2 rounded-md"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{application.candidateName}</p>
                    <p className="text-sm text-muted-foreground">
                      {application.jobTitle}
                      {application.candidateEmail
                        ? ` · ${application.candidateEmail}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
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
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
