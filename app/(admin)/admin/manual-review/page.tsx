import { CandidatesTable } from "@/components/candidates/candidates-table";
import { listCandidateApplications } from "@/lib/candidates/queries";
import { requireSessionUser } from "@/lib/auth/session";

export default async function ManualReviewPage() {
  const user = await requireSessionUser();
  const applications = await listCandidateApplications({
    status: "MANUAL_REVIEW",
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-mono text-xl tracking-tight sm:text-2xl lg:text-3xl">
          Manual review
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          CVs the AI could not process safely or applications flagged for human
          review. Update candidate details or delete invalid applications.
        </p>
      </div>

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
