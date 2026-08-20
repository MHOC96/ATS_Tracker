import { CandidatesTable } from "@/components/candidates/candidates-table";
import { listCandidateApplications } from "@/lib/candidates/queries";

export default async function CandidatesPage() {
  const applications = await listCandidateApplications();

  return (
    <div className="space-y-8">
      <div>
          <h1 className="font-mono text-xl tracking-tight sm:text-2xl lg:text-3xl">Candidates</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review applications, AI scores, and recruiter decisions.
        </p>
      </div>

      <CandidatesTable applications={applications} />
    </div>
  );
}
