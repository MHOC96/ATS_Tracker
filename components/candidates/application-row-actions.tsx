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
    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
      {canEdit && (
        <Link
          href={`/admin/candidates/${applicationId}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "w-full justify-center sm:w-auto"
          )}
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
          className="w-full justify-center sm:w-auto"
        />
      )}
    </div>
  );
}
