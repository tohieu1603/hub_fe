"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Machine } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Server, Circle } from "lucide-react";

const statusStyle: Record<string, string> = {
  available: "bg-slate-700 text-slate-300",
  assigned: "bg-emerald-600/20 text-emerald-400 border-emerald-600/30",
  offline: "bg-red-600/20 text-red-400 border-red-600/30",
  maintenance: "bg-amber-600/20 text-amber-400 border-amber-600/30",
};

const statusDot: Record<string, string> = {
  available: "text-slate-400",
  assigned: "text-emerald-400",
  offline: "text-red-400",
  maintenance: "text-amber-400",
};

export default function AdminMachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", hub_url: "", subdomain: "", hub_api_key: "" });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const m = await api.machines.list();
      setMachines(Array.isArray(m) ? m : []);
    } catch { toast.error("Failed"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name || !form.hub_url) { toast.error("Name and Hub URL required"); return; }
    try {
      await api.machines.create(form);
      toast.success("Machine created");
      setShowCreate(false);
      setForm({ name: "", hub_url: "", subdomain: "", hub_api_key: "" });
      load();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
  };

  if (loading) return <p className="text-slate-400 p-8">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Server className="size-6 text-slate-300" />
          <div>
            <h1 className="text-xl font-bold text-slate-100">Machines</h1>
            <p className="text-xs text-slate-400">{machines.length} machines configured</p>
          </div>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowCreate(true)}>
          <Plus className="size-4 mr-1.5" /> Add Machine
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Name</TableHead>
                <TableHead className="text-slate-400">Hub URL</TableHead>
                <TableHead className="text-slate-400">Subdomain</TableHead>
                <TableHead className="text-slate-400">Assigned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {machines.map((m) => (
                <TableRow key={m.id} className="border-slate-800">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Circle className={`size-2.5 fill-current ${statusDot[m.status] || statusDot.available}`} />
                      <Badge className={`${statusStyle[m.status] || statusStyle.available} text-xs`}>{m.status}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-100 font-medium">{m.name}</TableCell>
                  <TableCell className="text-slate-400 text-sm font-mono max-w-[300px] truncate">{m.hub_url}</TableCell>
                  <TableCell className="text-slate-400 text-sm">{m.subdomain || "—"}</TableCell>
                  <TableCell className="text-sm">
                    {m.assigned_user_id ? (
                      <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30 text-xs">assigned</Badge>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {machines.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-slate-500 py-8">No machines yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Machine</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300 text-sm">Name</Label>
              <Input placeholder="Mac Mini #1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-slate-800 border-slate-700 text-slate-100 mt-1.5" />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Hub URL</Label>
              <Input placeholder="https://mac1.trycloudflare.com" value={form.hub_url} onChange={(e) => setForm({ ...form, hub_url: e.target.value })}
                className="bg-slate-800 border-slate-700 text-slate-100 mt-1.5" />
              <p className="text-xs text-slate-500 mt-1">Cloudflare Tunnel URL or internal IP:port</p>
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Hub API Key</Label>
              <Input placeholder="Paste HUB_API_KEY from Hub .env" value={form.hub_api_key}
                onChange={(e) => setForm({ ...form, hub_api_key: e.target.value })}
                className="bg-slate-800 border-slate-700 text-slate-100 mt-1.5 font-mono text-xs" />
              <p className="text-xs text-slate-500 mt-1">Copy từ Hub .env trên Mac Mini (mỗi Hub 1 key riêng)</p>
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Subdomain (optional)</Label>
              <Input placeholder="mac1" value={form.subdomain} onChange={(e) => setForm({ ...form, subdomain: e.target.value })}
                className="bg-slate-800 border-slate-700 text-slate-100 mt-1.5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-700 text-slate-300" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={create}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
