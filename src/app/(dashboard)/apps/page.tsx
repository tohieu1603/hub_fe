"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { HubApp } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function statusBadgeClass(status: string) {
  switch (status) {
    case "active":
    case "online":
      return "bg-emerald-600/20 text-emerald-400 border-emerald-600/30";
    case "degraded":
      return "bg-yellow-600/20 text-yellow-400 border-yellow-600/30";
    default:
      return "bg-red-600/20 text-red-400 border-red-600/30";
  }
}

export default function AppsPage() {
  const [apps, setApps] = useState<HubApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    api.hub
      .apps()
      .then((res) => setApps(res.data ?? []))
      .catch(() => setError("Failed to load apps"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {apps.length === 0 && (
        <p className="text-slate-500 text-sm">No apps connected.</p>
      )}
      <div className="grid grid-cols-1 gap-3 md:gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {apps.map((app) => (
          <Card
            key={app.app_id}
            className="bg-slate-900 border-slate-800 cursor-pointer hover:border-slate-700 transition-colors active:bg-slate-800/50"
            onClick={() =>
              setExpanded(expanded === app.app_id ? null : app.app_id)
            }
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setExpanded(expanded === app.app_id ? null : app.app_id);
              }
            }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <CardTitle className="text-slate-100 text-sm">
                    {app.name}
                  </CardTitle>
                  <span className="text-xs text-slate-500">v{app.version}</span>
                </div>
                <Badge
                  className={`${statusBadgeClass(app.status)} text-xs shrink-0`}
                >
                  {app.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <CardDescription className="text-slate-400 text-xs line-clamp-2">
                {app.description}
              </CardDescription>
              <span className="text-xs text-slate-500">
                {app.capabilities?.length ?? 0} capabilities
              </span>

              {expanded === app.app_id && app.capabilities?.length > 0 && (
                <div className="flex flex-col gap-1.5 border-t border-slate-800 pt-3 mt-1">
                  <span className="text-xs font-medium text-slate-300 mb-1">
                    Capabilities
                  </span>
                  {app.capabilities.map((cap) => (
                    <div
                      key={cap.capability_id}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-xs text-slate-300 truncate">
                        {cap.name}
                      </span>
                      <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-xs shrink-0">
                        {cap.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
