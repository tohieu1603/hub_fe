"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { AdminUser, Machine } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Shield, Trash2, Monitor, Link2Off, Users } from "lucide-react";

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
    await api.admin.setRole(u.id, u.role === "admin" ? "user" : "admin");
    toast.success(`${u.name} → ${u.role === "admin" ? "user" : "admin"}`);
    load();
  };

  const deleteUser = async (u: AdminUser) => {
    if (!confirm(`Delete ${u.name}?`)) return;
    await api.admin.deleteUser(u.id);
    toast.success("Deleted");
    load();
  };

  const assignMachine = async (userId: string, machineId: string) => {
    try {
      await api.machines.assign(machineId, userId);
      toast.success("Assigned");
      setAssignDialog(null);
      load();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
  };

  const unassign = async (machineId: string) => {
    await api.machines.unassign(machineId);
    toast.success("Unassigned");
    load();
  };

  const available = machines.filter((m) => m.status === "available");

  if (loading) return <p className="text-slate-400 p-8">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="size-6 text-blue-400" />
        <div>
          <h1 className="text-xl font-bold text-slate-100">Users</h1>
          <p className="text-xs text-slate-400">{users.length} users registered</p>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Name</TableHead>
                <TableHead className="text-slate-400">Email</TableHead>
                <TableHead className="text-slate-400">Role</TableHead>
                <TableHead className="text-slate-400">Machine</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className="border-slate-800">
                  <TableCell className="text-slate-100 font-medium">{u.name}</TableCell>
                  <TableCell className="text-slate-400 text-sm">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={u.role === "admin" ? "border-amber-600/50 text-amber-400" : "border-slate-600 text-slate-400"}>{u.role}</Badge>
                  </TableCell>
                  <TableCell>
                    {u.machine ? (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30 text-xs">{u.machine.name}</Badge>
                        <Button size="icon" variant="ghost" className="size-7 text-red-400 hover:text-red-300" title="Unassign" onClick={() => unassign(u.machine!.id)}>
                          <Link2Off className="size-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="border-slate-700 text-slate-400 text-xs h-7" onClick={() => setAssignDialog(u)}>
                        <Monitor className="size-3 mr-1" /> Assign
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" className="size-8 text-slate-400 hover:text-amber-400" title="Toggle role" onClick={() => toggleRole(u)}>
                        <Shield className="size-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="size-8 text-slate-400 hover:text-red-400" title="Delete" onClick={() => deleteUser(u)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!assignDialog} onOpenChange={() => setAssignDialog(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Hub to {assignDialog?.name}</DialogTitle>
          </DialogHeader>
          {available.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No available machines.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-auto">
              {available.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-emerald-600 cursor-pointer transition-colors"
                  onClick={() => assignDialog && assignMachine(assignDialog.id, m.id)}>
                  <div>
                    <p className="text-sm font-medium text-slate-100">{m.name}</p>
                    <p className="text-xs text-slate-400">{m.hub_url}</p>
                  </div>
                  <Badge className="bg-slate-700 text-slate-300 text-xs">available</Badge>
                </div>
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
