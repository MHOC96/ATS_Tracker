import { NotFoundPage } from "@/components/layout/not-found-page";

export default function PublicNotFound() {
  return (
    <NotFoundPage
      title="Role not found"
      description="This job posting may have been closed, removed, or the link is incorrect."
      homeHref="/"
      homeLabel="Careers home"
      secondaryHref="/jobs"
      secondaryLabel="Browse open roles"
    />
  );
}
