"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import * as auth from "@/services/auth.service";
import type { MeResponse } from "@/types/auth";
import { getAccessToken, getRefreshToken, registerAuthFailureHandler } from "@/lib/api";

type User = MeResponse;

type AuthCtx = {
  isAuthed: boolean;
  isInitializing: boolean;
  // True after the user chose to log out, so RequireAuth doesn't send them
  // to the login page instead of where logout() is taking them.
  signedOut: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  // Logs out and goes to redirectTo (the home page by default).
  logout: (redirectTo?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [signedOut, setSignedOut] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Also drops all loaded data, so the next user never sees the last one's.
  const clearAuthState = useCallback(() => {
    setUser(null);
    setIsAuthed(false);
    queryClient.clear();
  }, [queryClient]);

  const refreshUser = useCallback(async () => {
    // No tokens means a logged-out visitor: skip the /me call entirely.
    if (!getAccessToken() && !getRefreshToken()) {
      clearAuthState();
      setIsInitializing(false);
      return;
    }

    try {
      const me = await auth.me();
      setUser(me);
      setIsAuthed(true);
      setSignedOut(false);
    } catch {
      await auth.logout();
      clearAuthState();
    } finally {
      setIsInitializing(false);
    }
  }, [clearAuthState]);

  const logout = useCallback(
    async (redirectTo = "/") => {
      setSignedOut(true);
      await auth.logout();
      clearAuthState();
      router.replace(redirectTo);
    },
    [clearAuthState, router]
  );

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
      signedOut,
      user,
      login: async (email, password) => {
        await auth.login(email, password);
        await refreshUser();
      },
      logout,
      refreshUser,
    }),
    [isAuthed, isInitializing, signedOut, user, logout, refreshUser]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within <AuthProvider />");
  return v;
}