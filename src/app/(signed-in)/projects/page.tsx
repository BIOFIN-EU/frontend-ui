"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCases } from "@/queries/projects";
import { caseListService } from "@/services/case-list.service";
import { ProjectListScreen } from "@/components/projects/ProjectListScreen";
import { WaitingBanner } from "@/components/projects/WaitingBanner";
import { AllProjectsPanel } from "@/components/projects/AllProjectsPanel";
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
  // Set by the project dashboard after deleting, or by a delete from this list.
  const searchParams = useSearchParams();
  const deletedParam = searchParams.get("deleted");
  const [deletedCaseId, setDeletedCaseId] = useState<string | null>(
    deletedParam && /^\d+$/.test(deletedParam) ? deletedParam : null
  );

  const { data: cases, isPending, error } = useCases();

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

      {isPending && (
        <div className="rounded-2xl surface-panel p-6 text-fg/70">
          Loading projects...
        </div>
      )}

      {error && (
        <Alert tone="danger">
          {caseListService.extractErrorMessage(error)}
        </Alert>
      )}

      {cases && (
        <>
          {/* Steps waiting for one of the user's roles (hidden when none). */}
          <WaitingBanner cases={cases} />

          {/* Administrators only. */}
          <AllProjectsPanel />

          {/* A delete removes the project from the list itself (useDeleteCase). */}
          <ProjectListScreen cases={cases} onDeleted={(caseId) => setDeletedCaseId(String(caseId))} />
        </>
      )}
    </div>
  );
}
