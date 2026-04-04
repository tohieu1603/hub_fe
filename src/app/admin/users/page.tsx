"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { AdminUser, Machine } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Shield, Trash2, Monitor } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [assignDialog, setAssignDialog] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [u, m] = await Promise.all([api.admin.users(), api.machines.list()]);
      setUsers(u);
      setMachines(Array.isArray(m) ? m : []);
    } catch { toast.error("Failed to load"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleRole = async (u: AdminUser) => {
    const newRole = u.role === "admin" ? "user" : "admin";
    await api.admin.setRole(u.id, newRole);
    toast.success(`${u.name} → ${newRole}`);
    load();
  };

  const deleteUser = async (u: AdminUser) => {
    if (!confirm(`Delete ${u.name}? This will unassign their machine.`)) return;
    await api.admin.deleteUser(u.id);
    toast.success("Deleted");
    load();
  };

  const assignMachine = async (userId: string, machineId: string) => {
    await api.machines.assign(machineId, userId);
    toast.success("Machine assigned");
    setAssignDialog(null);
    load();
  };

  const unassignMachine = async (machineId: string) => {
    await api.machines.unassign(machineId);
    toast.success("Unassigned");
    load();
  };

  const availableMachines = machines.filter((m) => m.status === "available");

  if (loading) return <p className="text-slate-400">Loading...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-100">Users ({users.length})</h1>

      <div className="space-y-3">
        {users.map((u) => (
          <Card key={u.id} className="bg-slate-900 border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-slate-100 font-medium">{u.name}</span>
                  <Badge className={u.role === "admin" ? "bg-amber-600/20 text-amber-400 border-amber-600/30" : "bg-slate-700 text-slate-300 border-slate-600"}>
                    {u.role}
                  </Badge>
                </div>
                <p className="text-sm text-slate-400">{u.email}</p>
                {u.machine ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Monitor className="size-3 text-emerald-400 shrink-0" />
                    <span className="text-xs text-emerald-400 truncate">{u.machine.name} — {u.machine.hub_url}</span>
                    <Button size="sm" variant="ghost" className="text-xs text-red-400 h-6 px-2 shrink-0" onClick={() => unassignMachine(u.machine!.id)}>
                      Unassign
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">No machine</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!u.machine && (
                  <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 text-xs" onClick={() => setAssignDialog(u)}>
                    <Monitor className="size-3 mr-1" /> Assign
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="text-slate-400" onClick={() => toggleRole(u)} title="Toggle role">
                  <Shield className="size-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-red-400" onClick={() => deleteUser(u)} title="Delete user">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!assignDialog} onOpenChange={() => setAssignDialog(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle>Assign machine to {assignDialog?.name}</DialogTitle>
          </DialogHeader>
          {availableMachines.length === 0 ? (
            <p className="text-slate-400 text-sm">No available machines. Add one in Machines page.</p>
          ) : (
            <div className="space-y-2">
              {availableMachines.map((m) => (
                <Card key={m.id} className="bg-slate-800 border-slate-700 p-3 cursor-pointer hover:border-emerald-600 transition-colors"
                  onClick={() => assignDialog && assignMachine(assignDialog.id, m.id)}>
                  <p className="text-slate-100 font-medium">{m.name}</p>
                  <p className="text-xs text-slate-400">{m.hub_url}</p>
                </Card>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="border-slate-700 text-slate-300" onClick={() => setAssignDialog(null)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
