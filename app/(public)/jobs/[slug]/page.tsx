import { notFound } from "next/navigation";
import { ApplyForm } from "@/components/jobs/apply-form";
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
    <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_min(100%,26rem)] lg:items-start lg:gap-12 xl:grid-cols-[minmax(0,1fr)_28rem]">
      <JobPublicView job={job} />
      <div className="w-full lg:sticky lg:top-8 lg:self-start">
        <ApplyForm jobSlug={job.slug} jobTitle={job.title} />
      </div>
    </div>
  );
}
