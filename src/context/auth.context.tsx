"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as auth from "@/services/auth.service";

type User = auth.MeResponse;

type AuthCtx = {
  isAuthed: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

function hasAccessToken() {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem("access_token"));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const refreshUser = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

    if (!token) {
      setIsAuthed(false);
      setUser(null);
      return;
    }

    try {
      const me = await auth.me(); // calls /api/auth/me and auto-refreshes if needed
      setUser(me);
      setIsAuthed(true);
    } catch {
      auth.logout();              // clears tokens
      setUser(null);
      setIsAuthed(false);
    }
  };

  useEffect(() => {
    // initial load
    refreshUser();

    // keep in sync across tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === "access_token" || e.key === "refresh_token") {
        refreshUser();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      isAuthed,
      user,
      login: async (email, password) => {
        await auth.login(email, password);
        await refreshUser();
      },
      logout: () => {
        auth.logout();
        setIsAuthed(false);
        setUser(null);
      },
      refreshUser,
    }),
    [isAuthed, user]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within <AuthProvider />");
  return v;
}