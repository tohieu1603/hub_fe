"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  MessageSquare,
  AppWindow,
  Settings,
  Users,
  Server,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/skills", label: "Skills", icon: Zap },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/apps", label: "Apps", icon: AppWindow },
  { href: "/settings", label: "Settings", icon: Settings },
];

const adminItems = [
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/machines", label: "Machines", icon: Server },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const renderLink = ({ href, label, icon: Icon }: typeof navItems[0]) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link key={href} href={href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active ? "bg-emerald-600/20 text-emerald-400" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
        )}>
        <Icon className="size-4 shrink-0" />
        {label}
      </Link>
    );
  };

  return (
    <aside className="w-64 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col min-h-screen">
      <div className="px-5 py-5 border-b border-slate-800">
        <span className="text-lg font-semibold text-slate-100 tracking-tight">
          MulApps Hub
        </span>
      </div>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(renderLink)}

        {isAdmin && (
          <>
            <div className="mt-4 mb-1 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Admin
            </div>
            {adminItems.map(renderLink)}
          </>
        )}
      </nav>
    </aside>
  );
}
