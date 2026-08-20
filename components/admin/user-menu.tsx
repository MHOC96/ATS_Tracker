"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppUser } from "@/lib/auth/session";

type UserMenuProps = {
  user: AppUser;
};

export function UserMenu({ user }: UserMenuProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium leading-none">
          {user.fullName ?? user.email}
        </p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {user.role}
        </p>
      </div>
      <form action="/auth/signout" method="post">
        <Button type="submit" variant="ghost" size="icon-sm" title="Sign out">
          <LogOut className="size-4" />
          <span className="sr-only">Sign out</span>
        </Button>
      </form>
    </div>
  );
}
