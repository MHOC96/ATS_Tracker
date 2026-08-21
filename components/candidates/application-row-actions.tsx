"use client";

import Link from "next/link";
import { ApplicationDeleteButton } from "@/components/candidates/application-delete-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ApplicationRowActionsProps = {
  applicationId: string;
  canEdit: boolean;
  canDelete: boolean;
  redirectAfterDelete?: string;
};

export function ApplicationRowActions({
  applicationId,
  canEdit,
  canDelete,
  redirectAfterDelete,
}: ApplicationRowActionsProps) {
  if (!canEdit && !canDelete) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
      {canEdit && (
        <Link
          href={`/admin/candidates/${applicationId}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          View
        </Link>
      )}
      {canDelete && (
        <ApplicationDeleteButton
          applicationId={applicationId}
          redirectTo={redirectAfterDelete}
          variant="inline"
          canDelete={canDelete}
        />
      )}
    </div>
  );
}
