"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth.context";
import { caseListService } from "@/services/case-list.service";
import type { CaseListItem } from "@/types/case-list";
import { ProjectListScreen } from "@/components/projects/ProjectListScreen";
import { BngWaitingBanner } from "@/components/bng/BngWaitingBanner";
import { Alert } from "@/components/ui/Alert";

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
        <h1 className="text-3xl font-semibold tracking-tight text-fg">
          Projects
        </h1>
        <p className="text-sm text-fg/70">
          Loading project access…
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      {deletedCaseId && (
        <Alert tone="success" className="flex items-center justify-between gap-4">
          <span>Project #{deletedCaseId} deleted.</span>
          <button
            type="button"
            onClick={() => setDeletedCaseId(null)}
            aria-label="Dismiss"
            className="rounded-md px-2 py-1 text-accent-100/80 hover:bg-fg/10 hover:text-fg"
          >
            ✕
          </button>
        </Alert>
      )}

      {loading && (
        <div className="rounded-2xl surface-panel p-6 text-fg/70">
          Loading projects...
        </div>
      )}

      {!loading && error && (
        <Alert tone="danger">
          {error}
        </Alert>
      )}

      {/* BNG only: steps waiting for one of the user's roles (hidden when none). */}
      {!loading && !error && <BngWaitingBanner cases={cases} />}

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