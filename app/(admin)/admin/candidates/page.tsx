import { CandidatesTable } from "@/components/candidates/candidates-table";
import { PageTitle } from "@/components/layout/page-title";
import { listCandidateApplications } from "@/lib/candidates/queries";
import { requireSessionUser } from "@/lib/auth/session";

export default async function CandidatesPage() {
  const user = await requireSessionUser();
  const applications = await listCandidateApplications();

  return (
    <div className="space-y-8">
      <PageTitle
        title="Candidates"
        description="Review applications, AI scores, and recruiter decisions."
      />

      <CandidatesTable
        applications={applications}
        showActions
        canEdit={user.role !== "REVIEWER"}
        canDelete={user.role === "ADMIN"}
        deleteRedirectTo="/admin/candidates"
      />
    </div>
  );
}
