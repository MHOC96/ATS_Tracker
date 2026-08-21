import Link from "next/link";
import { Briefcase } from "lucide-react";
import { JobOpeningCard } from "@/components/public/job-opening-card";
import { listPublishedJobs } from "@/lib/jobs/queries";

export default async function JobsIndexPage() {
  const jobs = await listPublishedJobs();

  return (
    <div className="min-w-0 space-y-6 sm:space-y-8">
      <header className="space-y-2 border-b border-graphite pb-5 sm:pb-6">
        <h1 className="text-balance font-[510] leading-tight tracking-[-0.018em] text-paper [font-size:clamp(1.5rem,3vw+0.5rem,2.25rem)]">
          Open roles
        </h1>
        <p className="text-[13px] text-fog sm:text-[14px]">
          {jobs.length === 0
            ? "No vacancies published at the moment."
            : `${jobs.length} ${jobs.length === 1 ? "vacancy" : "vacancies"} — select a role to view details and apply.`}
        </p>
      </header>

      {jobs.length === 0 ? (
        <section
          className="rounded-xl border border-dashed border-graphite bg-carbon/50 px-5 py-10 text-center sm:py-14"
          aria-label="No open roles"
        >
          <div className="mx-auto flex max-w-md flex-col items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl border border-graphite bg-obsidian text-fog">
              <Briefcase className="size-5" strokeWidth={1.75} aria-hidden />
            </span>
            <p className="text-[15px] text-mist">No open roles right now.</p>
            <Link href="/" className="text-[13px] text-fog hover:text-paper hover:underline">
              Back to careers home
            </Link>
          </div>
        </section>
      ) : (
        <ul className="grid min-w-0 grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-2">
          {jobs.map((job) => (
            <li key={job.id} className="min-w-0">
              <JobOpeningCard job={job} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
