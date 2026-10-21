"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/context/auth.context";

/**
 * Shows its content only to signed-out visitors (e.g. "Login required" on the
 * home page). Nothing is shown while the login state is still being checked,
 * so it doesn't flash for someone who is signed in.
 */
export function SignedOutOnly({ children }: { children: ReactNode }) {
  const { isAuthed, isInitializing } = useAuth();
  if (isInitializing || isAuthed) return null;
  return <>{children}</>;
}
