import { CandidatesTable } from "@/components/candidates/candidates-table";
import { listCandidateApplications } from "@/lib/candidates/queries";

export default async function ManualReviewPage() {
  const applications = await listCandidateApplications({
    status: "MANUAL_REVIEW",
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-mono text-2xl tracking-tight lg:text-3xl">
          Manual review
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          CVs the AI could not process safely or applications flagged for human
          review.
        </p>
      </div>

      <CandidatesTable
        applications={applications}
        emptyMessage="No applications need manual review right now."
      />
    </div>
  );
}
