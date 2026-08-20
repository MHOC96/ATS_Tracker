import { NotFoundPage } from "@/components/layout/not-found-page";

export default function AdminNotFound() {
  return (
    <NotFoundPage
      title="Admin page not found"
      description="This admin page does not exist or you may not have access to it."
      homeHref="/admin"
      homeLabel="Dashboard"
      secondaryHref="/admin/jobs"
      secondaryLabel="View jobs"
    />
  );
}
