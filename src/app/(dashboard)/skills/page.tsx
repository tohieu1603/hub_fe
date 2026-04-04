"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Capability } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkillExecuteDialog } from "@/components/skill-execute-dialog";

export default function SkillsPage() {
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Capability | null>(null);

  useEffect(() => {
    api.hub
      .capabilities()
      .then((res) => setCapabilities(res.data ?? []))
      .catch(() => setError("Failed to load skills"))
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

  // Group by app_name
  const grouped = capabilities.reduce<Record<string, Capability[]>>(
    (acc, cap) => {
      const key = cap.app_name ?? "Unknown";
      if (!acc[key]) acc[key] = [];
      acc[key].push(cap);
      return acc;
    },
    {}
  );

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {Object.entries(grouped).map(([appName, caps]) => (
        <section key={appName}>
          <h2 className="text-sm md:text-base font-semibold text-slate-100 mb-3">
            {appName}
          </h2>
          <div className="grid grid-cols-1 gap-3 md:gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {caps.map((cap) => (
              <Card
                key={cap.capability_id}
                className="bg-slate-900 border-slate-800 cursor-pointer hover:border-emerald-600/40 transition-colors active:bg-slate-800/50"
                onClick={() => setSelected(cap)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(cap);
                  }
                }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-100">
                    {cap.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {cap.description}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-xs">
                      {cap.category}
                    </Badge>
                    {cap.is_async && (
                      <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs">
                        async
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}

      {capabilities.length === 0 && (
        <p className="text-slate-500 text-sm">No skills available.</p>
      )}

      {selected && (
        <SkillExecuteDialog
          capability={selected}
          open={!!selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
