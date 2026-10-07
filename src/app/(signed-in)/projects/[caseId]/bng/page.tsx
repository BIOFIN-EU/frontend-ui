"use client";

import { useParams } from "next/navigation";

import { useCaseDashboard } from "@/queries/projects";
import type { BngMetricSummary } from "@/types/bng";
import { BngCaseSummary } from "@/components/bng/BngCaseSummary";
import { HabitatParcelsCard } from "@/components/bng/BngDashboardCards";
import { Alert } from "@/components/ui/Alert";

// What happens around and after a BNG project's pathway: the metric worked
// out from its habitats, reservation requests and allocations, finances,
// transactions, monitoring and sign-offs. The Overview tab shows only what
// was entered in the pathway's steps.
export default function ProjectBngPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const { data: state, isPending, error } = useCaseDashboard(caseId);

  if (isPending) {
    return <div className="rounded-2xl surface-panel p-4 sm:p-6 text-fg/70">Loading…</div>;
  }
  if (error || !state) {
    return <Alert tone="danger">{error?.message || "Could not load the project."}</Alert>;
  }
  if (!state.bng_metric) {
    return <Alert tone="info">This project is not a Biodiversity Net Gain project.</Alert>;
  }

  // The habitat steps (baseline and proposed), with the units of each parcel.
  const habitatSteps = Object.entries(state.workflow_config?.steps ?? {}).filter(
    ([, step]) => step.ui_mode === "habitat_table"
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight text-fg">Biodiversity Net Gain</h2>

      <BngCaseSummary
        caseId={state.caseId}
        summary={state.bng_metric as BngMetricSummary}
        steps={state.workflow_config?.steps}
        signoffs={state.bng_signoffs}
      />

      {habitatSteps.map(([code, step]) => (
        <section key={code} className="space-y-3">
          <h3 className="text-base font-semibold text-fg">{step.title}: habitat units</h3>
          <HabitatParcelsCard parcels={state[code]} showUnits />
        </section>
      ))}
    </div>
  );
}
