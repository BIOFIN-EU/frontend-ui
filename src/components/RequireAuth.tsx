"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth.context";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthed, isInitializing, signedOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // After a chosen logout, logout() does the navigating.
    if (!isInitializing && !isAuthed && !signedOut) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthed, isInitializing, signedOut, pathname, router]);

  if (isInitializing) {
    return (
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-fg">Loading…</h1>
        <p className="text-sm text-fg/70">Checking your session.</p>
      </section>
    );
  }

  if (!isAuthed) {
    return null;
  }

  return <>{children}</>;
}