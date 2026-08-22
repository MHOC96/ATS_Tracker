import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type JobsPaginationProps = {
  total: number;
  page: number;
  pageSize: number;
};

export function JobsPagination({ total, page, pageSize }: JobsPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (totalPages <= 1) return null;

  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  return (
    <nav
      className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-graphite pt-4"
      aria-label="Jobs pagination"
    >
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        {prevPage ? (
          <Link
            href={`/admin/jobs?page=${prevPage}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Previous
          </Link>
        ) : (
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "pointer-events-none opacity-50"
            )}
          >
            Previous
          </span>
        )}
        {nextPage ? (
          <Link
            href={`/admin/jobs?page=${nextPage}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Next
          </Link>
        ) : (
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "pointer-events-none opacity-50"
            )}
          >
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
