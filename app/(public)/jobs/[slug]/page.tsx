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
    <div className="grid gap-8 lg:grid-cols-[1fr_min(100%,360px)] lg:gap-10">
      <JobPublicView job={job} />
      <div className="lg:sticky lg:top-8 lg:self-start">
        <ApplyForm jobSlug={job.slug} jobTitle={job.title} />
      </div>
    </div>
  );
}
