"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { HubApp, Capability } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, AppWindow, Zap, Activity } from "lucide-react";

interface ActivityItem {
  type?: string;
  details?: string;
  [key: string]: unknown;
}

export default function DashboardPage() {
  const { machine } = useAuth();
  const [apps, setApps] = useState<HubApp[]>([]);
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [hubOffline, setHubOffline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statusRes, appsRes, capsRes, actRes] = await Promise.all([
          api.hub.status(),
          api.hub.apps(),
          api.hub.capabilities(),
          api.hub.activity(),
        ]);
        if ((statusRes as { status?: string }).status === "offline") {
          setHubOffline(true);
        }
        setApps(appsRes.data ?? []);
        setCapabilities(capsRes.data ?? []);
        setActivity((actRes.data ?? []) as ActivityItem[]);
      } catch {
        setHubOffline(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {hubOffline && (
        <div className="rounded-lg border border-yellow-600/30 bg-yellow-600/10 px-4 py-3 text-sm text-yellow-400">
          Hub is offline. Some data may be unavailable.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Machine card */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-300 text-sm font-medium">
                Machine
              </CardTitle>
              <Server className="size-4 text-slate-500" />
            </div>
          </CardHeader>
          <CardContent>
            {machine ? (
              <div className="flex flex-col gap-1">
                <span className="text-slate-100 font-semibold">{machine.name}</span>
                <Badge
                  className={
                    machine.status === "active"
                      ? "bg-emerald-600/20 text-emerald-400 border-emerald-600/30 w-fit text-xs"
                      : "bg-red-600/20 text-red-400 border-red-600/30 w-fit text-xs"
                  }
                >
                  {machine.status}
                </Badge>
                <span className="text-xs text-slate-500 truncate">
                  {machine.hub_url}
                </span>
              </div>
            ) : (
              <span className="text-slate-500 text-sm">No machine assigned</span>
            )}
          </CardContent>
        </Card>

        {/* Apps card */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-300 text-sm font-medium">
                Apps
              </CardTitle>
              <AppWindow className="size-4 text-slate-500" />
            </div>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-slate-100">
              {apps.length}
            </span>
            <p className="text-xs text-slate-500 mt-1">Connected apps</p>
          </CardContent>
        </Card>

        {/* Skills card */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-300 text-sm font-medium">
                Skills
              </CardTitle>
              <Zap className="size-4 text-slate-500" />
            </div>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-slate-100">
              {capabilities.length}
            </span>
            <p className="text-xs text-slate-500 mt-1">Total capabilities</p>
          </CardContent>
        </Card>

        {/* Activity card */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-300 text-sm font-medium">
                Activity
              </CardTitle>
              <Activity className="size-4 text-slate-500" />
            </div>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <span className="text-slate-500 text-sm">No recent activity</span>
            ) : (
              <ul className="flex flex-col gap-1">
                {activity.slice(0, 5).map((item, i) => (
                  <li key={i} className="text-xs text-slate-400 truncate">
                    <span className="text-slate-300">{item.type ?? "event"}</span>
                    {item.details ? ` — ${String(item.details).slice(0, 40)}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
