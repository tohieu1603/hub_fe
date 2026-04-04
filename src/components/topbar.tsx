"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/skills": "Skills",
  "/chat": "Chat",
  "/apps": "Apps",
  "/settings": "Settings",
};

export function Topbar() {
  const pathname = usePathname();
  const { user, machine, logout } = useAuth();

  const title = pageTitles[pathname] ?? "Hub";

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-base font-semibold text-slate-100">{title}</h1>
      <div className="flex items-center gap-3">
        {machine ? (
          <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30 text-xs">
            {machine.name}
          </Badge>
        ) : (
          <Badge className="bg-red-600/20 text-red-400 border-red-600/30 text-xs">
            No machine
          </Badge>
        )}
        {user && (
          <span className="text-sm text-slate-400 hidden sm:block">
            {user.name}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={logout}
          className="text-slate-400 hover:text-slate-100"
        >
          <LogOut className="size-4" />
          <span className="sr-only">Logout</span>
        </Button>
      </div>
    </header>
  );
}
