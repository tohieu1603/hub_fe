"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { AdminUser, Machine } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Server, UserCheck, Zap, AlertTriangle } from "lucide-react";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [skillCount, setSkillCount] = useState(0);

  useEffect(() => {
    api.admin.users().then(setUsers).catch(() => {});
    api.machines.list().then((m) => setMachines(Array.isArray(m) ? m : [])).catch(() => {});
    api.hub.capabilities().then((r) => setSkillCount((r as { data?: unknown[] }).data?.length || 0)).catch(() => {});
  }, []);

  const assigned = machines.filter((m) => m.status === "assigned").length;
  const available = machines.filter((m) => m.status === "available").length;
  const offline = machines.filter((m) => m.status === "offline").length;

  const stats = [
    { label: "Total Users", value: users.length, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Machines", value: machines.length, icon: Server, color: "text-slate-300", bg: "bg-slate-500/10" },
    { label: "Assigned", value: assigned, icon: UserCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Skills", value: skillCount, icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Admin Overview</h1>
        <p className="text-sm text-slate-400 mt-1">System status and quick stats</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="bg-slate-900 border-slate-800">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
                  <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
                </div>
                <div className={`p-3 rounded-xl ${bg}`}>
                  <Icon className={`size-6 ${color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {offline > 0 && (
        <Card className="bg-red-950/30 border-red-900/50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="size-5 text-red-400 shrink-0" />
            <span className="text-red-300 text-sm font-medium">{offline} machine(s) offline</span>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Users */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Recent Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {users.slice(0, 5).map((u) => (
              <div key={u.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-800/50">
                <div>
                  <span className="text-slate-100 font-medium text-sm">{u.name}</span>
                  <span className="text-slate-500 text-xs ml-2">{u.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={u.role === "admin" ? "border-amber-600/50 text-amber-400 text-xs" : "border-slate-600 text-slate-400 text-xs"}>
                    {u.role}
                  </Badge>
                  {u.machine ? (
                    <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30 text-xs">{u.machine.name}</Badge>
                  ) : (
                    <Badge variant="outline" className="border-slate-700 text-slate-500 text-xs">No machine</Badge>
                  )}
                </div>
              </div>
            ))}
            {users.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No users</p>}
          </CardContent>
        </Card>

        {/* Machines */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Machines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {machines.slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-800/50">
                <div>
                  <span className="text-slate-100 font-medium text-sm">{m.name}</span>
                  <span className="text-slate-500 text-xs ml-2 truncate max-w-[200px] inline-block align-bottom">{m.hub_url}</span>
                </div>
                <Badge className={
                  m.status === "assigned" ? "bg-emerald-600/20 text-emerald-400 border-emerald-600/30 text-xs" :
                  m.status === "offline" ? "bg-red-600/20 text-red-400 border-red-600/30 text-xs" :
                  "bg-slate-700 text-slate-300 border-slate-600 text-xs"
                }>{m.status}</Badge>
              </div>
            ))}
            {machines.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No machines</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
