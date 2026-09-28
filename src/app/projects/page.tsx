"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth.context";
import { caseListService } from "@/services/case-list.service";
import type { CaseListItem } from "@/types/case-list";
import { ProjectListScreen } from "@/components/projects/ProjectListScreen";

// useSearchParams needs a Suspense boundary for the production build.
export default function CasesPage() {
  return (
    <Suspense fallback={null}>
      <CasesPageInner />
    </Suspense>
  );
}

function CasesPageInner() {
  const { user } = useAuth();
  // Set by the project dashboard after deleting, or by a delete from this list.
  const searchParams = useSearchParams();
  const deletedParam = searchParams.get("deleted");
  const [deletedCaseId, setDeletedCaseId] = useState<string | null>(
    deletedParam && /^\d+$/.test(deletedParam) ? deletedParam : null
  );

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
          Projects
        </h1>
        <p className="text-sm text-white/70">
          Loading project access…
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      {deletedCaseId && (
        <div
          role="status"
          className="flex items-center justify-between gap-4 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
        >
          <span>Project #{deletedCaseId} deleted.</span>
          <button
            type="button"
            onClick={() => setDeletedCaseId(null)}
            aria-label="Dismiss"
            className="rounded-md px-2 py-1 text-emerald-100/80 hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 text-white/70">
          Loading projects...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && (
        <ProjectListScreen
          cases={cases}
          onDeleted={(caseId) => {
            setCases((current) => current.filter((item) => item.caseId !== caseId));
            setDeletedCaseId(String(caseId));
          }}
        />
      )}
    </div>
  );
}