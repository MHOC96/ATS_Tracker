import { notFound } from "next/navigation";
import { ApplyForm } from "@/components/jobs/apply-form";
import { JobPublicHeader } from "@/components/jobs/job-public-header";
import { JobPublicView } from "@/components/jobs/job-public-view";
import { getPublishedJobBySlug } from "@/lib/jobs/queries";

type JobDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: JobDetailPageProps) {
  const { slug } = await params;
  const job = await getPublishedJobBySlug(slug);

  return {
    title: job ? `${job.title} — Careers` : "Job not found",
    description: job?.description ?? "Apply for this role",
  };
}

export default async function PublicJobDetailPage({ params }: JobDetailPageProps) {
  const { slug } = await params;
  const job = await getPublishedJobBySlug(slug);

  if (!job) notFound();

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl">
      <div className="hidden lg:block lg:mb-6 lg:border-b lg:border-graphite lg:pb-5">
        <JobPublicHeader job={job} variant="hero" />
      </div>

      <div className="flex flex-col gap-6 sm:gap-7 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-x-10 xl:grid-cols-[minmax(0,1fr)_23rem] xl:gap-x-12">
        <div className="min-w-0">
          <div className="lg:hidden">
            <JobPublicHeader job={job} className="mb-5 sm:mb-6" />
          </div>
          <JobPublicView job={job} omitHeader className="min-w-0" />
        </div>

        <aside className="min-w-0 w-full lg:sticky lg:top-[4.75rem] lg:self-start">
          <ApplyForm jobSlug={job.slug} jobTitle={job.title} layout="sidebar" />
        </aside>
      </div>
    </div>
  );
}
