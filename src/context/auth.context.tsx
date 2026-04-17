"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import * as auth from "@/services/auth.service";
import { registerAuthFailureHandler } from "@/lib/api";

type User = auth.MeResponse;

type AuthCtx = {
  isAuthed: boolean;
  isInitializing: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const clearAuthState = useCallback(() => {
    setUser(null);
    setIsAuthed(false);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await auth.me();
      setUser(me);
      setIsAuthed(true);
    } catch {
      await auth.logout();
      clearAuthState();
    } finally {
      setIsInitializing(false);
    }
  }, [clearAuthState]);

  const logout = useCallback(async () => {
    await auth.logout();
    clearAuthState();
  }, [clearAuthState]);

  useEffect(() => {
    registerAuthFailureHandler(() => {
      clearAuthState();
    });

    refreshUser();

    const onStorage = (e: StorageEvent) => {
      if (e.key === "access_token" || e.key === "refresh_token") {
        refreshUser();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refreshUser, clearAuthState]);

  const value = useMemo<AuthCtx>(
    () => ({
      isAuthed,
      isInitializing,
      user,
      login: async (email, password) => {
        await auth.login(email, password);
        await refreshUser();
      },
      logout,
      refreshUser,
    }),
    [isAuthed, isInitializing, user, logout, refreshUser]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within <AuthProvider />");
  return v;
}