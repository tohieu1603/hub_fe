"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Machine } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Server } from "lucide-react";

const statusColor: Record<string, string> = {
  available: "bg-slate-700 text-slate-300",
  assigned: "bg-emerald-600/20 text-emerald-400",
  offline: "bg-red-600/20 text-red-400",
  maintenance: "bg-amber-600/20 text-amber-400",
};

export default function AdminMachinesPage() {
  const { user } = useAuth();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", hub_url: "", subdomain: "" });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const m = await api.machines.list();
      setMachines(Array.isArray(m) ? m : []);
    } catch { toast.error("Failed to load machines"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (user?.role !== "admin") return <p className="text-red-400 p-8">Admin only</p>;

  const createMachine = async () => {
    if (!form.name || !form.hub_url) { toast.error("Name and Hub URL required"); return; }
    try {
      await api.machines.create(form);
      toast.success("Machine created");
      setShowCreate(false);
      setForm({ name: "", hub_url: "", subdomain: "" });
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  if (loading) return <p className="text-slate-400 p-8">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-100">Machines ({machines.length})</h1>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowCreate(true)}>
          <Plus className="size-4 mr-1" /> Add Machine
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {machines.map((m) => (
          <Card key={m.id} className="bg-slate-900 border-slate-800 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Server className="size-5 text-slate-400" />
                <span className="text-slate-100 font-medium">{m.name}</span>
              </div>
              <Badge className={statusColor[m.status] || statusColor.available}>
                {m.status}
              </Badge>
            </div>
            <div className="mt-3 space-y-1 text-sm">
              <p className="text-slate-400">URL: <span className="text-slate-300">{m.hub_url}</span></p>
              {m.subdomain && <p className="text-slate-400">Subdomain: <span className="text-slate-300">{m.subdomain}</span></p>}
              {m.assigned_user_id ? (
                <p className="text-emerald-400 text-xs mt-2">Assigned to user</p>
              ) : (
                <p className="text-slate-500 text-xs mt-2">Available</p>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-2 font-mono truncate">{m.id}</p>
          </Card>
        ))}
      </div>

      {/* Create Machine Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle>Add New Machine</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">Name</Label>
              <Input placeholder="Mac Mini #1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-slate-800 border-slate-700 text-slate-100 mt-1" />
            </div>
            <div>
              <Label className="text-slate-300">Hub URL</Label>
              <Input placeholder="https://mac1.example.com or http://localhost:3000" value={form.hub_url}
                onChange={(e) => setForm({ ...form, hub_url: e.target.value })}
                className="bg-slate-800 border-slate-700 text-slate-100 mt-1" />
            </div>
            <div>
              <Label className="text-slate-300">Subdomain (optional)</Label>
              <Input placeholder="mac1" value={form.subdomain} onChange={(e) => setForm({ ...form, subdomain: e.target.value })}
                className="bg-slate-800 border-slate-700 text-slate-100 mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-700 text-slate-300" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={createMachine}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
