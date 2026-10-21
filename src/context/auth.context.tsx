"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import * as auth from "@/services/auth.service";
import type { MeResponse } from "@/types/auth";
import { getAccessToken, getRefreshToken, registerAuthFailureHandler } from "@/lib/api";

type User = MeResponse;

type AuthCtx = {
  isAuthed: boolean;
  isInitializing: boolean;
  // True on the page the user just logged out from, so RequireAuth doesn't
  // send them to the login page instead of where logout() is taking them.
  // Anywhere else it's false again: a page that needs an account then sends
  // a signed-out visitor to log in, as usual.
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
  // The page the user logged out from, until they've left it.
  const [signedOutFrom, setSignedOutFrom] = useState<string | null>(null);
  const pathname = usePathname();
  const signedOut = signedOutFrom !== null && signedOutFrom === pathname;
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
      setSignedOutFrom(null);
    } catch {
      await auth.logout();
      clearAuthState();
    } finally {
      setIsInitializing(false);
    }
  }, [clearAuthState]);

  const logout = useCallback(
    async (redirectTo = "/") => {
      setSignedOutFrom(window.location.pathname);
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

  // Once logout has taken them elsewhere, forget it: before, the flag stayed
  // set for the whole visit, so every page needing an account showed blank.
  useEffect(() => {
    if (signedOutFrom !== null && pathname !== signedOutFrom) setSignedOutFrom(null);
  }, [pathname, signedOutFrom]);

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