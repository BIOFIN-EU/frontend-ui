"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { useAuth } from "@/context/auth.context";
import { caseDashboardService } from "@/services/case-dashboard.service";
import type { CaseDashboardState } from "@/types/workflow";
import { CaseDashboardScreen } from "@/components/cases/CaseDashboardScreen";
import { CaseDashboardMenu } from "@/components/cases/CaseDashboardMenu";
import { useCaseUsers } from "@/components/cases/hooks/useCaseUsers";
import { ThresholdScale } from "@/components/risk/ThresholdScale";

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
          Case dashboard
        </h1>
        <p className="text-sm text-white/70">Loading case access…</p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex w-fit items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/25">
            Loan Identifier #{caseId}
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Loan Dashboard
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
            Review submitted workflow data, biodiversity risk context, and case
            access settings.
          </p>
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
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
          <main className="min-w-0 space-y-8">
            <CaseDashboardScreen key={String(caseId)} state={state} />

            {!usersLoading && canManageUsers && (
              <>
                <ThresholdScale
                  value={0.29889303158720826}
                  thresholds={{
                    low: 0.09285714285714287,
                    "medium-low": 0.25000000000000006,
                    medium: 0.5,
                    "medium-high": 0.7500000000000001,
                    high: 0.9458333333333333,
                  }}
                />

                <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                    Risk interpretation
                  </p>

                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                    What this biodiversity risk score means
                  </h2>

                  <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70">
                    This case has an indicative biodiversity risk score of{" "}
                    <span className="font-semibold text-white">29.9%</span>,
                    which falls in the{" "}
                    <span className="font-semibold text-emerald-200">
                      Medium Low
                    </span>{" "}
                    risk category. This suggests that the area is not currently
                    classified as high risk, but there are still opportunities to
                    improve habitat quality, species resilience, and ecological
                    connectivity.
                  </p>

                  <div className="mt-6 grid gap-4 lg:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-white/45">
                        Main risk driver
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-white">
                        Low species suitability
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-white/65">
                        The example explanation rule indicates that species
                        suitability is low. This could mean the current land
                        conditions offer limited nesting, feeding, or shelter
                        opportunities for the selected bird species.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-white/45">
                        Priority habitat opportunity
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-white">
                        Woodland edges and field margins
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-white/65">
                        Several species in the SRI list are associated with
                        trees, shrubs, woodland edges, hedgerows, and
                        structurally diverse farmland.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-white/45">
                        Protected area context
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-white">
                        Unprotected landscape
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-white/65">
                        The XAI rule refers to an unprotected area.
                        Nature-positive actions could therefore focus on
                        voluntary farm-level measures and local ecological
                        corridors.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5 ring-1 ring-emerald-400/20">
                    <h3 className="text-lg font-semibold text-emerald-100">
                      Suggested nature-positive actions
                    </h3>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl bg-black/20 p-4">
                        <p className="font-semibold text-white">
                          Plant native hedgerows
                        </p>
                        <p className="mt-1 text-sm text-white/65">
                          Improve shelter, nesting habitat, and movement
                          corridors for birds and insects.
                        </p>
                      </div>

                      <div className="rounded-xl bg-black/20 p-4">
                        <p className="font-semibold text-white">
                          Create flower-rich margins
                        </p>
                        <p className="mt-1 text-sm text-white/65">
                          Increase insect availability, which supports species
                          such as redstarts, warblers, pipits, and nightingales.
                        </p>
                      </div>

                      <div className="rounded-xl bg-black/20 p-4">
                        <p className="font-semibold text-white">
                          Retain mature trees
                        </p>
                        <p className="mt-1 text-sm text-white/65">
                          Support treecreepers, woodpeckers, tits, jays, and
                          other woodland species.
                        </p>
                      </div>

                      <div className="rounded-xl bg-black/20 p-4">
                        <p className="font-semibold text-white">
                          Reduce pesticide pressure
                        </p>
                        <p className="mt-1 text-sm text-white/65">
                          Help restore insect populations and improve food
                          availability across the site.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}
          </main>

          <aside className="min-w-0 xl:sticky xl:top-24">
            <CaseDashboardMenu
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