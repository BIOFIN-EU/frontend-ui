"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useAuth } from "@/context/auth.context";
import { caseDashboardService } from "@/services/case-dashboard.service";
import type { CaseDashboardState } from "@/types/case-dashboard";
import { ProjectDashboardScreen } from "@/components/projects/ProjectDashboardScreen";
import { ProjectDashboardMenu } from "@/components/projects/ProjectDashboardMenu";
import { DeleteProjectDialog } from "@/components/projects/DeleteProjectDialog";
import { useCaseUsers } from "@/components/projects/hooks/useCaseUsers";

export default function CaseDashboardPage() {
  const params = useParams<{ caseId: string }>();
  const caseId = params.caseId;

  const { user } = useAuth();
  const router = useRouter();

  const { users } = useCaseUsers(Number(caseId));
  const canDelete = Boolean(users.find((u) => u.user_id === user?.id)?.can_delete);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
    return <p className="text-sm text-white/70">Loading project access…</p>;
  }

  return (
    <div className="space-y-8">
      {loading && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 text-white/70">
          Loading project dashboard...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {!loading && state && (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
          <main className="min-w-0 space-y-8">
            <ProjectDashboardScreen key={String(caseId)} state={state} />
          </main>

          <aside className="min-w-0 xl:sticky xl:top-24">
            <ProjectDashboardMenu
              caseId={caseId}
              state={state}
              onDelete={canDelete ? () => setConfirmDelete(true) : undefined}
            />
          </aside>
        </div>
      )}

      <DeleteProjectDialog
        open={confirmDelete}
        caseId={caseId}
        onClose={() => setConfirmDelete(false)}
        onDeleted={() => router.replace(`/projects?deleted=${caseId}`)}
      />
    </div>
  );
}