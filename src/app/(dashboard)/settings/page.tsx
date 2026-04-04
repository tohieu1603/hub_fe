"use client";

import { useAuth } from "@/lib/auth-context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LogOut, User, Server } from "lucide-react";

export default function SettingsPage() {
  const { user, machine, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="flex flex-col gap-4 md:gap-6 w-full max-w-xl">
      {/* User info */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User className="size-4 text-slate-400" />
            <CardTitle className="text-slate-100 text-sm font-medium">
              Account
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-slate-500 shrink-0">Name</span>
            <span className="text-sm text-slate-100 text-right break-all">
              {user.name}
            </span>
          </div>
          <Separator className="bg-slate-800" />
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-slate-500 shrink-0">Email</span>
            <span className="text-sm text-slate-100 text-right break-all">
              {user.email}
            </span>
          </div>
          <Separator className="bg-slate-800" />
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-slate-500 shrink-0">Role</span>
            <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-xs">
              {user.role}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Machine info */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Server className="size-4 text-slate-400" />
            <CardTitle className="text-slate-100 text-sm font-medium">
              Machine
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {machine ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-slate-500 shrink-0">Name</span>
                <span className="text-sm text-slate-100 text-right">
                  {machine.name}
                </span>
              </div>
              <Separator className="bg-slate-800" />
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs text-slate-500 shrink-0">Hub URL</span>
                <span className="text-sm text-slate-100 text-right break-all max-w-[65%]">
                  {machine.hub_url}
                </span>
              </div>
              <Separator className="bg-slate-800" />
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-slate-500 shrink-0">Status</span>
                <Badge
                  className={
                    machine.status === "active"
                      ? "bg-emerald-600/20 text-emerald-400 border-emerald-600/30 text-xs"
                      : "bg-red-600/20 text-red-400 border-red-600/30 text-xs"
                  }
                >
                  {machine.status}
                </Badge>
              </div>
            </>
          ) : (
            <span className="text-sm text-slate-500">No machine assigned</span>
          )}
        </CardContent>
      </Card>

      {/* Logout */}
      <Button
        variant="destructive"
        onClick={logout}
        className="w-full sm:w-fit gap-2 min-h-[44px]"
      >
        <LogOut className="size-4" />
        Sign out
      </Button>
    </div>
  );
}
