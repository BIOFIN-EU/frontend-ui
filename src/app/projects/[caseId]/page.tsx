"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { useAuth } from "@/context/auth.context";
import { caseDashboardService } from "@/services/case-dashboard.service";
import type { CaseDashboardState } from "@/types/case-dashboard";
import { ProjectDashboardScreen } from "@/components/projects/ProjectDashboardScreen";
import { ProjectDashboardMenu } from "@/components/projects/ProjectDashboardMenu";
import { useCaseUsers } from "@/components/projects/hooks/useCaseUsers";

export default function CaseDashboardPage() {
  const params = useParams<{ caseId: string }>();
  const caseId = params.caseId;
  const numericCaseId = Number(caseId);

  const { user } = useAuth();

  const [state, setState] = useState<CaseDashboardState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { users, loading: usersLoading } = useCaseUsers(numericCaseId);

  const myAccess = users.find((u) => u.user_id === user?.id);
  const canManageUsers = Boolean(myAccess?.can_assign_users);

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
          Project dashboard
        </h1>
        <p className="text-sm text-white/70">Loading project access…</p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex w-fit items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/25">
            Project Identifier #{caseId}
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Project Dashboard
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
            Review and edit project data
          </p>
        </div>
      </header>

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

            {!usersLoading && canManageUsers}
          </main>

          <aside className="min-w-0 xl:sticky xl:top-24">
            <ProjectDashboardMenu
              caseId={caseId}
              state={state}
              canManageUsers={!usersLoading && canManageUsers}
            />
          </aside>
        </div>
      )}
    </div>
  );
}