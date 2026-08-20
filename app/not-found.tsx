import { NotFoundPage } from "@/components/layout/not-found-page";

export default function RootNotFound() {
  return (
    <NotFoundPage
      fullPage
      homeHref="/"
      homeLabel="Careers home"
      secondaryHref="/jobs"
      secondaryLabel="Browse open roles"
    />
  );
}
