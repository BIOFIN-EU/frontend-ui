"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/auth.context";
import { caseDashboardService } from "@/services/case-dashboard.service";
import type { CaseDashboardState } from "@/types/case-dashboard";
import { CaseDashboardScreen } from "@/components/cases/CaseDashboardScreen";

export default function CaseDashboardPage() {
  const params = useParams<{ caseId: string }>();
  const caseId = params.caseId;
  const { user } = useAuth();

  const [state, setState] = useState<CaseDashboardState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadState() {
    try {
      setLoading(true);
      const data = await caseDashboardService.getCaseDashboard(caseId);
      setState(data);
      setError("");
    } catch (err) {
      console.error("load case dashboard failed", err);
      setError(caseDashboardService.extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (caseId && user) {
      loadState();
    }
  }, [caseId, user]);

  if (!user) {
    return (
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Case dashboard
        </h1>
        <p className="text-sm text-white/70">Loading case access…</p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div className="inline-flex w-fit items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/25">
          Case #{caseId}
        </div>
      </header>

      {loading && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 text-white/70">
          Loading case dashboard...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {!loading && state && (
        <CaseDashboardScreen key={String(caseId)} state={state} />
      )}
    </div>
  );
}