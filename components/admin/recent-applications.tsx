import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecentApplicationRow } from "@/lib/dashboard/queries";
import { formatApplicationStatus } from "@/packages/shared/schemas";

type RecentApplicationsProps = {
  applications: RecentApplicationRow[];
};

export function RecentApplications({ applications }: RecentApplicationsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent applications</CardTitle>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-[13px] text-fog">No applications yet.</p>
            <p className="mt-1 text-[12px] text-fog">
              Applications appear once candidates apply or recruiters upload CVs.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-graphite">
            {applications.map((application) => (
              <li key={application.id}>
                <Link
                  href={`/admin/candidates/${application.id}`}
                  className="flex flex-col gap-2 rounded-md px-2 py-4 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-[510] text-paper">
                      {application.candidateName}
                    </p>
                    <p className="truncate text-[12px] text-fog">
                      {application.jobTitle}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end sm:gap-3">
                    {application.score !== null && (
                      <span className="linear-mono text-[13px] text-mist">
                        {Math.round(application.score)}%
                      </span>
                    )}
                    <Badge variant="outline">
                      {formatApplicationStatus(application.status)}
                    </Badge>
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
