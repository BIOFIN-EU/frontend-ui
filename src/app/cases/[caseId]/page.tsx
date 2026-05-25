"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { useAuth } from "@/context/auth.context";
import { caseDashboardService } from "@/services/case-dashboard.service";
import type { CaseDashboardState } from "@/types/workflow";
import { CaseDashboardScreen } from "@/components/cases/CaseDashboardScreen";
import { CaseDashboardMenu } from "@/components/cases/CaseDashboardMenu";
import { useCaseUsers } from "@/components/cases/hooks/useCaseUsers";
import { BiodiversityRiskInsight } from "@/components/risk/BiodiversityRiskInsight";


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


const HARDCODED_EXPLANATION_BLOCKS = [
  {
    template:
      "This region contains a {{protected_area}} with {{critical_habitat}} status and exhibits a {{species_richness}}. These characteristics collectively indicate a {{biodiversity_loss}}.",
    placeholders: {
      protected_area: {
        text: "Protected Area",
        data_type: "protected_area_assessment",
      },
      critical_habitat: {
        text: "likely Critical Habitat",
        data_type: "critical_habitat_status",
      },
      species_richness: {
        text: "low Species Richness Index",
        data_type: "species_richness_metrics",
      },
      biodiversity_loss: {
        text: "high likelihood of Biodiversity Loss",
        data_type: "biodiversity_loss_assessment",
      },
    },
  },
  {
    template:
      "Furthermore, based on {{climate_projections}} and {{urban_expansion}} modelling, this area demonstrates {{climate_resilience}} in the face of a future worst-case scenario for climate-change.",
    placeholders: {
      climate_projections: {
        text: "future climate projections",
        data_type: "climate_projection_models",
      },
      urban_expansion: {
        text: "projected urban expansion",
        data_type: "urban_expansion_forecast",
      },
      climate_resilience: {
        text: "low climate-resilience",
        data_type: "climate_resilience_metrics",
      },
    },
  },
  {
    template:
      "Given these converging factors ({{biodiversity_loss_factors}} and {{climate_resilience_factor}}), we suggest that the following {{management_actions}} should be prioritised: Active Restoration (AR) and Passive Protection (PP). Capital allocation toward nature-positive activities within these intervention types should improve biodiversity outcomes while strengthening long-term resilience against future climate and urbanisation pressures.",
    placeholders: {
      biodiversity_loss_factors: {
        text: "high likelihood of Biodiversity Loss",
        data_type: "biodiversity_loss_assessment",
      },
      climate_resilience_factor: {
        text: "low climate-resilience",
        data_type: "climate_resilience_metrics",
      },
      management_actions: {
        text: "Management Actions",
        data_type: "management_priorities",
      },
    },
  },
];

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
            Case Identifier #{caseId}
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Case Dashboard
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
              <BiodiversityRiskInsight
              value={0.29889303158720826}
              thresholds={{
                low: 0.09285714285714287,
                "medium-low": 0.25000000000000006,
                medium: 0.5,
                "medium-high": 0.7500000000000001,
                high: 0.9458333333333333,
              }}
              explanationBlocks={HARDCODED_EXPLANATION_BLOCKS}
            />
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