"use client";

import { useState, useEffect } from "react";
import { api, apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Zap, CheckCircle, Loader2, Circle } from "lucide-react";

interface HubApp {
  app_id: string;
  name: string;
  status: string;
  version: string;
  base_url: string;
  capabilities: { capability_id: string; name: string; category: string }[];
}

const statusDot: Record<string, string> = {
  active: "text-emerald-400",
  degraded: "text-amber-400",
  offline: "text-red-400",
  healthy: "text-emerald-400",
};

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
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const register = async () => {
    if (!baseUrl.trim()) { toast.error("Base URL required"); return; }
    setRegistering(true);
    try {
      const res = await apiFetch<{ success: boolean; app_id?: string; error?: string }>("/hub/apps/register", {
        method: "POST", body: JSON.stringify({ base_url: baseUrl.trim() }),
      });
      if (res.success) {
        toast.success(`Registered: ${res.app_id}`);
        setShowRegister(false);
        setBaseUrl("");
        load();
      } else {
        toast.error(res.error || "Failed");
      }
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
    setRegistering(false);
  };

  if (loading) return <p className="text-slate-400 p-8">Loading...</p>;

  const totalSkills = apps.reduce((s, a) => s + (a.capabilities?.length || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="size-6 text-amber-400" />
          <div>
            <h1 className="text-xl font-bold text-slate-100">Registered Skills</h1>
            <p className="text-xs text-slate-400">{apps.length} apps, {totalSkills} capabilities</p>
          </div>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowRegister(true)}>
          <Plus className="size-4 mr-1.5" /> Register Skill
        </Button>
      </div>

      {apps.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-8 text-center">
            <Zap className="size-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No skills registered.</p>
            <p className="text-xs text-slate-500 mt-1">Hub may be offline or no apps connected.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {apps.map((app) => (
            <Card key={app.app_id} className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Circle className={`size-2.5 fill-current ${statusDot[app.status] || "text-slate-400"}`} />
                    <CardTitle className="text-base text-slate-100">{app.name}</CardTitle>
                    <Badge variant="outline" className="border-slate-700 text-slate-400 text-xs">v{app.version}</Badge>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">{app.base_url}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {app.capabilities?.map((cap) => (
                    <Badge key={cap.capability_id} className="bg-slate-800 text-slate-300 border-slate-700 text-xs font-mono">
                      {cap.capability_id}
                      {cap.category && <span className="text-slate-500 ml-1">({cap.category})</span>}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-3">{app.capabilities?.length || 0} capabilities registered</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Register Skill App</DialogTitle>
          </DialogHeader>
          <div>
            <Label className="text-slate-300 text-sm">Base URL</Label>
            <Input placeholder="http://localhost:3030" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)}
              className="bg-slate-800 border-slate-700 text-slate-100 mt-1.5" />
            <p className="text-xs text-slate-500 mt-1.5">Hub will fetch <code className="text-slate-400">/manifest</code> and <code className="text-slate-400">/health</code> from this URL.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-700 text-slate-300" onClick={() => setShowRegister(false)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={register} disabled={registering}>
              {registering ? <Loader2 className="size-4 animate-spin mr-1.5" /> : <CheckCircle className="size-4 mr-1.5" />}
              Register
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
