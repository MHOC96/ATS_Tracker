import { CreateJobForm } from "@/components/jobs/create-job-form";
import { PageTitle } from "@/components/layout/page-title";

export default function NewJobPage() {
  return (
    <div className="space-y-8">
      <PageTitle
        title="Create job"
        description="Define a vacancy, configure scoring weights (must total 100%), save as draft, then publish to create Drive folders."
      />

      <CreateJobForm />
    </div>
  );
}
