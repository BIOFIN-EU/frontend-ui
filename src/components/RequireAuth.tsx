"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth.context";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthed, isInitializing } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isInitializing && !isAuthed) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthed, isInitializing, pathname, router]);

  if (isInitializing) {
    return (
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Loading…</h1>
        <p className="text-sm text-white/70">Checking your session.</p>
      </section>
    );
  }

  if (!isAuthed) {
    return null;
  }

  return <>{children}</>;
}