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
        <p className="text-[13px] font-[510] leading-none text-paper">
          {user.fullName ?? user.email}
        </p>
        <p className="mt-1 linear-mono text-[10px] uppercase tracking-wider text-fog">
          {user.role}
        </p>
      </div>
      <form action="/auth/signout" method="post">
        <Button type="submit" variant="ghost" size="icon" className="min-h-11 min-w-11" title="Sign out">
          <LogOut className="size-4" />
          <span className="sr-only">Sign out</span>
        </Button>
      </form>
    </div>
  );
}
