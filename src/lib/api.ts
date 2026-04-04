import type { ChatMessage } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (res.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data as T;
}

export const api = {
  auth: {
    register: (body: { email: string; password: string; name: string }) =>
      apiFetch<{ token: string; user: import("@/types").User }>(
        "/auth/register",
        { method: "POST", body: JSON.stringify(body) }
      ),
    login: (body: { email: string; password: string }) =>
      apiFetch<{ token: string; user: import("@/types").User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    logout: () => apiFetch("/auth/logout", { method: "POST" }),
    me: () =>
      apiFetch<{
        user: import("@/types").User;
        machine: import("@/types").Machine | null;
      }>("/auth/me"),
  },
  hub: {
    status: () =>
      apiFetch<Record<string, unknown>>("/hub/status").catch(() => ({
        status: "offline",
      })),
    apps: () =>
      apiFetch<{ success: boolean; data: import("@/types").HubApp[] }>(
        "/hub/apps"
      ).catch(() => ({ success: false, data: [] })),
    capabilities: () =>
      apiFetch<{ success: boolean; data: import("@/types").Capability[] }>(
        "/hub/capabilities"
      ).catch(() => ({ success: false, data: [] })),
    dashboard: () =>
      apiFetch<{ success: boolean; data: Record<string, unknown> }>(
        "/hub/dashboard"
      ).catch(() => ({ success: false, data: {} })),
    execute: (body: {
      app_id: string;
      capability_id: string;
      input: Record<string, unknown>;
    }) => apiFetch("/hub/execute", { method: "POST", body: JSON.stringify(body) }),
    chat: (message: string, history?: ChatMessage[]) =>
      apiFetch<{ success: boolean; data: { reply: string; actions: string[] } }>(
        "/hub/chat",
        { method: "POST", body: JSON.stringify({ message, history }) }
      ),
    activity: () =>
      apiFetch<{ success: boolean; data: unknown[] }>("/hub/activity").catch(
        () => ({ success: false, data: [] })
      ),
  },
  machines: {
    list: () => apiFetch<import("@/types").Machine[]>("/machines"),
    create: (body: { name: string; hub_url: string; subdomain?: string }) =>
      apiFetch("/machines", { method: "POST", body: JSON.stringify(body) }),
    assign: (id: string, userId: string) =>
      apiFetch(`/machines/${id}/assign`, {
        method: "PUT",
        body: JSON.stringify({ user_id: userId }),
      }),
    unassign: (id: string) =>
      apiFetch(`/machines/${id}/unassign`, { method: "PUT" }),
  },
  admin: {
    users: () => apiFetch<import("@/types").AdminUser[]>("/admin/users"),
    setRole: (id: string, role: string) =>
      apiFetch(`/admin/users/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) }),
    deleteUser: (id: string) =>
      apiFetch(`/admin/users/${id}`, { method: "DELETE" }),
  },
};
