"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { AdminUser, Machine } from "@/types";
import { Card } from "@/components/ui/card";
import { Users, Server, UserCheck, AlertCircle } from "lucide-react";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);

  useEffect(() => {
    api.admin.users().then(setUsers).catch(() => {});
    api.machines.list().then((m) => setMachines(Array.isArray(m) ? m : [])).catch(() => {});
  }, []);

  const assigned = machines.filter((m) => m.status === "assigned").length;
  const available = machines.filter((m) => m.status === "available").length;
  const offline = machines.filter((m) => m.status === "offline").length;

  const stats = [
    { label: "Total Users", value: users.length, icon: Users, color: "text-blue-400" },
    { label: "Machines", value: machines.length, icon: Server, color: "text-slate-300" },
    { label: "Assigned", value: assigned, icon: UserCheck, color: "text-emerald-400" },
    { label: "Available", value: available, icon: Server, color: "text-amber-400" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-slate-100">Admin Overview</h1>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="bg-slate-900 border-slate-800 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{label}</p>
                <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
              </div>
              <Icon className={`size-8 ${color} opacity-50`} />
            </div>
          </Card>
        ))}
      </div>

      {offline > 0 && (
        <Card className="bg-red-950/30 border-red-800 p-4 flex items-center gap-3">
          <AlertCircle className="size-5 text-red-400" />
          <span className="text-red-300 text-sm">{offline} machine(s) offline</span>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-medium text-slate-200 mb-3">Recent Users</h2>
        <div className="space-y-2">
          {users.slice(0, 5).map((u) => (
            <div key={u.id} className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg px-4 py-3">
              <div>
                <span className="text-slate-100 font-medium">{u.name}</span>
                <span className="text-slate-500 text-sm ml-2">{u.email}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${u.machine ? "bg-emerald-600/20 text-emerald-400" : "bg-slate-700 text-slate-400"}`}>
                {u.machine ? u.machine.name : "No machine"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
