export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  machine?: Machine | null;
}

export interface Machine {
  id: string;
  name: string;
  subdomain: string;
  hub_url: string;
  status: string;
  specs: Record<string, unknown> | null;
  assigned_user_id: string | null;
  assigned_at: string | null;
}

export interface HubApp {
  app_id: string;
  name: string;
  status: string;
  version: string;
  description: string;
  capabilities: Capability[];
  _count?: { activity_logs: number };
}

export interface Capability {
  app_id: string;
  app_name: string;
  app_status: string;
  capability_id: string;
  name: string;
  description: string;
  category: string;
  is_async: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
