
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth.context";
import { caseListService } from "@/services/case-list.service";
import type { CaseListItem } from "@/types/case-list";
import { CaseListScreen } from "@/components/cases/CaseListScreen";

export default function CasesPage() {
  const { user } = useAuth();

  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCases() {
    try {
      setLoading(true);
      const data = await caseListService.getCases();
      setCases(data);
      setError("");
    } catch (err) {
      console.error("load cases failed", err);
      setError(caseListService.extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      loadCases();
    }
  }, [user]);

  if (!user) {
    return (
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Cases
        </h1>
        <p className="text-sm text-white/70">Loading case access…</p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div className="inline-flex w-fit items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/25">
          Case dashboard
        </div>
      </header>

      {loading && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 text-white/70">
          Loading cases...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && <CaseListScreen cases={cases} />}
    </div>
  );
}