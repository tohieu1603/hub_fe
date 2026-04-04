"use client";

import { useState, useEffect } from "react";
import { api, apiFetch } from "@/lib/api";
import type { Capability } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface HubApp {
  app_id: string;
  name: string;
  status: string;
  version: string;
  base_url: string;
  capabilities: { capability_id: string; name: string }[];
}

export default function AdminSkillsPage() {
  const [apps, setApps] = useState<HubApp[]>([]);
  const [showRegister, setShowRegister] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [registering, setRegistering] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.hub.apps();
      setApps((res as { success: boolean; data: HubApp[] }).data || []);
    } catch { /* hub offline */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const registerSkill = async () => {
    if (!baseUrl.trim()) { toast.error("Base URL required"); return; }
    setRegistering(true);
    try {
      const res = await apiFetch<{ success: boolean; app_id?: string; error?: string }>("/hub/apps/register", {
        method: "POST",
        body: JSON.stringify({ base_url: baseUrl.trim() }),
      });
      if (res.success) {
        toast.success(`Registered: ${res.app_id}`);
        setShowRegister(false);
        setBaseUrl("");
        load();
      } else {
        toast.error(res.error || "Registration failed");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
    setRegistering(false);
  };

  const statusColor: Record<string, string> = {
    active: "bg-emerald-600/20 text-emerald-400 border-emerald-600/30",
    degraded: "bg-amber-600/20 text-amber-400 border-amber-600/30",
    offline: "bg-red-600/20 text-red-400 border-red-600/30",
    healthy: "bg-emerald-600/20 text-emerald-400 border-emerald-600/30",
  };

  if (loading) return <p className="text-slate-400">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-100">Registered Skills ({apps.length} apps)</h1>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowRegister(true)}>
          <Plus className="size-4 mr-1" /> Register Skill
        </Button>
      </div>

      {apps.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800 p-8 text-center">
          <p className="text-slate-400">No skills registered. Hub may be offline or no apps connected.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {apps.map((app) => (
            <Card key={app.app_id} className="bg-slate-900 border-slate-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-slate-100 font-semibold">{app.name}</span>
                  <Badge className={statusColor[app.status] || statusColor.offline}>{app.status}</Badge>
                  <span className="text-xs text-slate-500">v{app.version}</span>
                </div>
                <span className="text-xs text-slate-400">{app.base_url}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {app.capabilities?.map((cap) => (
                  <Badge key={cap.capability_id} className="bg-slate-800 text-slate-300 border-slate-700 text-xs">
                    {cap.capability_id}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">{app.capabilities?.length || 0} capabilities</p>
            </Card>
          ))}
        </div>
      )}

      {/* Register Dialog */}
      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Register Skill App</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-slate-300">Base URL of the skill app</Label>
              <Input
                placeholder="http://localhost:3030 or https://skill.tunnel.com"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-100 mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                Hub will fetch /manifest and /health from this URL to register the skill.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-700 text-slate-300" onClick={() => setShowRegister(false)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={registerSkill} disabled={registering}>
              {registering ? <Loader2 className="size-4 animate-spin mr-1" /> : <CheckCircle className="size-4 mr-1" />}
              Register
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
