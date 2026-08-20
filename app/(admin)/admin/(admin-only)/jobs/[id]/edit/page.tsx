import Link from "next/link";
import { notFound } from "next/navigation";
import { EditJobForm } from "@/components/jobs/edit-job-form";
import { buttonVariants } from "@/components/ui/button";
import { getJobForEdit } from "@/lib/jobs/queries";
import { cn } from "@/lib/utils";

type EditJobPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { id } = await params;
  const job = await getJobForEdit(id);

  if (!job) notFound();

  if (job.status === "ARCHIVED") {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/admin/jobs/${job.id}`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-3 -ml-2")}
        >
          ← Back to job
        </Link>
        <h1 className="font-mono text-xl tracking-tight sm:text-2xl">Edit job</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Update {job.title} ({job.status.replace(/_/g, " ")})
        </p>
      </div>

      <EditJobForm job={job} />
    </div>
  );
}
