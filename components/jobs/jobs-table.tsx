import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export async function JobsTable() {
  const supabase = await createClient();
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, title, slug, job_type, status, published_at, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <p className="text-sm text-destructive">Failed to load jobs: {error.message}</p>
    );
  }

  if (!jobs?.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No jobs yet. Create your first vacancy to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-mono text-lg font-normal">All jobs</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {jobs.map((job) => (
            <li key={job.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/jobs/${job.id}`}
                  className="break-words text-sm font-medium hover:underline"
                >
                  {job.title}
                </Link>
                <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                  {job.slug} · {job.job_type.replace(/_/g, " ")}
                </p>
              </div>
              <Badge variant="outline" className="w-fit shrink-0">
                {job.status}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
