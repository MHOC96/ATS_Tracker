import { CandidatesTable } from "@/components/candidates/candidates-table";
import { listCandidateApplications } from "@/lib/candidates/queries";
import { requireSessionUser } from "@/lib/auth/session";

export default async function CandidatesPage() {
  const user = await requireSessionUser();
  const applications = await listCandidateApplications();

  return (
    <div className="space-y-8">
      <div>
          <h1 className="font-mono text-xl tracking-tight sm:text-2xl lg:text-3xl">Candidates</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review applications, AI scores, and recruiter decisions.
        </p>
      </div>

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
