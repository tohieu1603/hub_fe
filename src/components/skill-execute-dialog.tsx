"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { Capability } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Props {
  capability: Capability;
  open: boolean;
  onClose: () => void;
}

export function SkillExecuteDialog({ capability, open, onClose }: Props) {
  const [inputJson, setInputJson] = useState("{}");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async () => {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(inputJson);
    } catch {
      setError("Invalid JSON input");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.hub.execute({
        app_id: capability.app_id,
        capability_id: capability.capability_id,
        input: parsed,
      });
      setResult(JSON.stringify(res, null, 2));
    } catch (err) {
      const msg = err instanceof Error ? err.message : typeof err === "object" ? JSON.stringify(err) : String(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setInputJson("{}");
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-slate-100">{capability.name}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {capability.description}
          </DialogDescription>
          <div className="flex gap-2 flex-wrap mt-1">
            <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-xs">
              {capability.category}
            </Badge>
            {capability.is_async && (
              <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs">
                async
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-slate-300">
            Input (JSON)
          </label>
          <Textarea
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            className="font-mono text-xs bg-slate-800 border-slate-700 text-slate-100 min-h-24 resize-none"
            placeholder="{}"
          />
          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}
          {result && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-300">Result</label>
              <pre className="rounded-lg bg-slate-800 border border-slate-700 p-3 text-xs text-emerald-400 overflow-auto max-h-48 font-mono whitespace-pre-wrap">
                {result}
              </pre>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Close
          </Button>
          <Button
            onClick={handleExecute}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {loading ? "Running..." : "Execute"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
