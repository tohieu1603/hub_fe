"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  MessageSquare,
  AppWindow,
  Settings,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/skills", label: "Skills", icon: Zap },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/apps", label: "Apps", icon: AppWindow },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLinks({
  isAdmin,
  onNavigate,
}: {
  isAdmin: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const renderLink = ({ href, label, icon: Icon }: (typeof navItems)[0]) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        key={href}
        href={href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors min-h-[44px]",
          active
            ? "bg-emerald-600/20 text-emerald-400"
            : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
        )}
      >
        <Icon className="size-4 shrink-0" />
        {label}
      </Link>
    );
  };

  return (
    <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
      {navItems.map(renderLink)}
      {isAdmin && (
        <>
          <div className="mt-4 mb-1 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Admin
          </div>
          {renderLink({
            href: "/admin/dashboard",
            label: "Admin Panel",
            icon: ShieldCheck,
          })}
        </>
      )}
    </nav>
  );
}

function SidebarBrand() {
  return (
    <div className="px-5 py-5 border-b border-slate-800 shrink-0">
      <span className="text-lg font-semibold text-slate-100 tracking-tight">
        MulApps Hub
      </span>
    </div>
  );
}

export function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger button — fixed top-left, only visible on mobile */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-3 left-3 z-40 text-slate-400 hover:text-slate-100 hover:bg-slate-800 min-h-[44px] min-w-[44px]"
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </Button>

      {/* Mobile sheet drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-64 p-0 bg-slate-900 border-slate-800 flex flex-col"
        >
          <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800 shrink-0">
            <span className="text-lg font-semibold text-slate-100 tracking-tight">
              MulApps Hub
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-100 min-h-[44px] min-w-[44px]"
              aria-label="Close navigation"
            >
              <X className="size-4" />
            </Button>
          </div>
          <NavLinks isAdmin={isAdmin} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar — hidden on mobile */}
      <aside className="hidden md:flex w-64 shrink-0 bg-slate-900 border-r border-slate-800 flex-col min-h-screen">
        <SidebarBrand />
        <NavLinks isAdmin={isAdmin} />
      </aside>
    </>
  );
}
