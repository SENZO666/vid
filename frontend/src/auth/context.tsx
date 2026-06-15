// Auth + session context. Wraps the root layout, exposes the current user,
// and provides login/register/logout helpers that touch the local DB.

import { useRouter, type Href } from "expo-router";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  getSession,
  login as authLogin,
  logout as authLogout,
  register as authRegister,
} from "./index";
import { materializeRecurring } from "../recurring/materialize";

type Session = { userId: number; username: string };

type Ctx = {
  session: Session | null;
  loading: boolean;
  login: (u: string, p: string) => Promise<{ ok: boolean; error?: string }>;
  register: (u: string, p: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refresh = useCallback(async () => {
    setLoading(true);
    const s = await getSession();
    setSession(s);
    if (s) {
      // Run recurring materialiser on every cold start / refresh.
      try {
        await materializeRecurring(s.userId);
      } catch (e) {
        console.warn("recurring materialize failed", e);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (u: string, p: string) => {
      const res = await authLogin(u, p);
      if (res.ok) {
        await refresh();
        router.replace("/(tabs)" as Href);
        return { ok: true };
      }
      return { ok: false, error: res.error };
    },
    [refresh, router],
  );

  const register = useCallback(
    async (u: string, p: string) => {
      const res = await authRegister(u, p);
      if (res.ok) {
        await refresh();
        router.replace("/(tabs)" as Href);
        return { ok: true };
      }
      return { ok: false, error: res.error };
    },
    [refresh, router],
  );

  const logout = useCallback(async () => {
    await authLogout();
    setSession(null);
    router.replace("/(auth)/login" as Href);
  }, [router]);

  const value = useMemo<Ctx>(
    () => ({ session, loading, login, register, logout, refresh }),
    [session, loading, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): Ctx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider />");
  return ctx;
}
