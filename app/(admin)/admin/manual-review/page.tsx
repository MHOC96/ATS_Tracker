import { CandidatesTable } from "@/components/candidates/candidates-table";
import { PageTitle } from "@/components/layout/page-title";
import { listCandidateApplications } from "@/lib/candidates/queries";
import { requireSessionUser } from "@/lib/auth/session";

export default async function ManualReviewPage() {
  const user = await requireSessionUser();
  const applications = await listCandidateApplications({
    status: "MANUAL_REVIEW",
  });

  return (
    <div className="space-y-8">
      <PageTitle
        title="Manual review"
        description="CVs the AI could not process safely or applications flagged for human review."
      />

      <CandidatesTable
        applications={applications}
        emptyMessage="No applications need manual review right now."
        showActions
        canEdit={user.role !== "REVIEWER"}
        canDelete={user.role === "ADMIN"}
        deleteRedirectTo="/admin/manual-review"
      />
    </div>
  );
}
