import { CreateJobForm } from "@/components/jobs/create-job-form";
import { requireAdminUser } from "@/lib/auth/session";

export default async function NewJobPage() {
  await requireAdminUser();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-mono text-2xl tracking-tight">Create Job</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Define a vacancy, configure scoring weights (must total 100%), save as
          draft, then publish to create Drive folders.
        </p>
      </div>

      <CreateJobForm />
    </div>
  );
}
