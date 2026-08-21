import Link from "next/link";
import { notFound } from "next/navigation";
import { EditJobForm } from "@/components/jobs/edit-job-form";
import { PageTitle } from "@/components/layout/page-title";
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
        <PageTitle
          title="Edit job"
          description={`Update ${job.title} (${job.status.replace(/_/g, " ")})`}
        />
      </div>

      <EditJobForm job={job} />
    </div>
  );
}
