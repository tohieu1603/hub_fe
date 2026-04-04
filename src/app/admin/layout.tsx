"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Server, LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const adminNav = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/machines", label: "Machines", icon: Server },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push("/login"); return; }
      if (user.role !== "admin") { router.push("/dashboard"); return; }
      setReady(true);
    }
  }, [user, loading, router]);

  if (!ready) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><p className="text-slate-400">Loading...</p></div>;

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Admin Sidebar */}
      <aside className="w-64 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="px-5 py-5 border-b border-slate-800">
          <span className="text-lg font-semibold text-amber-400 tracking-tight">Admin Panel</span>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {adminNav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-amber-600/20 text-amber-400" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                )}>
                <Icon className="size-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-800 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-100 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            <ArrowLeft className="size-4" /> Back to App
          </Link>
          <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-red-400 px-3" onClick={logout}>
            <LogOut className="size-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
