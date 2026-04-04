"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { User, Machine } from "@/types";

interface AuthContextValue {
  user: User | null;
  machine: Machine | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  machine: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [machine, setMachine] = useState<Machine | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setUser(null);
      setMachine(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.auth.me();
      setUser(res.user);
      setMachine(res.machine);
    } catch {
      setUser(null);
      setMachine(null);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = async (token: string) => {
    localStorage.setItem("token", token);
    await refresh();
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem("token");
    setUser(null);
    setMachine(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, machine, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
