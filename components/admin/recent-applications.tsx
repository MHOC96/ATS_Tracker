import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getRecentApplications } from "@/lib/dashboard/queries";

export async function RecentApplications() {
  const applications = await getRecentApplications();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-mono text-lg font-normal">
          Recent Applications
        </CardTitle>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">No applications yet.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Applications appear here once candidates apply via the public careers
              page or admin upload.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {applications.map((application, index) => (
              <li key={application.id}>
                <Link
                  href={`/admin/candidates/${application.id}`}
                  className="flex items-center justify-between gap-4 py-4 transition-colors hover:bg-muted/40 -mx-2 px-2 rounded-md"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {application.candidateName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {application.jobTitle}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {application.score !== null && (
                      <span className="font-mono text-sm">
                        {Math.round(application.score)}%
                      </span>
                    )}
                    <Badge variant="outline">{application.status}</Badge>
                  </div>
                </Link>
                {index < applications.length - 1 && <Separator />}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
