"use client";

import { useEffect, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Printer } from "lucide-react";
import { useCaseDashboard } from "@/queries/projects";
import { useCaseRisk } from "@/queries/risk";
import ManagementActionsMap from "@/components/maps/ManagementActionsMap";
import RiskMap from "@/components/maps/RiskMap";
import {
  formatLocationArea,
  formatLocationValue,
  formatValue,
  getFieldValue,
  getObjectLabel,
  getOrderedSteps,
  getStepData,
  locationMapWkt,
} from "@/components/projects/ProjectDashboardScreen";
import { isoToDisplay } from "@/components/ui/DatePicker";
import { buttonClass } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { formatDate } from "@/lib/format";
import { buildMetricsFromCase, explanationText, prettifyRiskLabel } from "@/lib/vulnerability";
import type { CaseDashboardState } from "@/types/case-dashboard";
import type { CaseLocationEntry } from "@/types/case-location";
import type { CaseRiskEntry, PriorityActionsCaseResponse } from "@/types/risk";
import type { WorkflowField } from "@/types/workflow";

type RiskState = {
  entries: CaseRiskEntry<PriorityActionsCaseResponse>[] | undefined;
  loading: boolean;
  error: string | null;
};

// BNG metric screens: their detail is in the BNG report, not this summary.
const BNG_UI_MODES = new Set(["habitat_table", "bng_metric", "bng_allocation"]);

/** Print it in light mode, whatever the screen uses, then put the theme back. */
function usePrintInLightMode() {
  useEffect(() => {
    const root = document.documentElement;
    let previous: string | undefined;
    const before = () => {
      previous = root.dataset.theme;
      root.dataset.theme = "light";
    };
    const after = () => {
      if (previous === undefined) delete root.dataset.theme;
      else root.dataset.theme = previous;
    };
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, []);
}

function Section({ title, children, keepTogether = true }: { title: string; children: ReactNode; keepTogether?: boolean }) {
  return (
    <section className={`rounded-2xl surface-card p-4 sm:p-5 print:rounded-none print:border-0 print:border-t print:p-0 print:pt-4 ${keepTogether ? "break-inside-avoid" : ""}`}>
      <h2 className="text-lg font-semibold text-fg">{title}</h2>
      <div className="mt-3 text-sm text-fg/80">{children}</div>
    </section>
  );
}

function Details({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2 print:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="break-inside-avoid">
          <dt className="text-xs font-semibold uppercase tracking-wider text-fg/50">{label}</dt>
          <dd className="mt-0.5 whitespace-pre-line text-fg">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function fieldText(state: CaseDashboardState, stepCode: string, field: WorkflowField): string {
  const value = getFieldValue(state, getStepData(state, stepCode), field, stepCode);
  if (field.type === "date" && typeof value === "string" && value) return isoToDisplay(value);
  if (field.type === "checkbox") return value ? "Yes" : "No";
  return formatValue(value);
}

// Every step in the pathway's order, each shown the way its kind of step
// needs: answers, sites (with the Vulnerability Index), intermediaries or
// uploaded documents. Consent and the BNG metric screens are left out.
function StepSections({ state, risks }: { state: CaseDashboardState; risks: RiskState }) {
  return (
    <>
      {getOrderedSteps(state).map(({ code, step }) => {
        const mode = step.ui_mode ?? "form";
        if (code === "consent" || BNG_UI_MODES.has(mode)) return null;
        if (mode === "location_table") {
          return <SitesSection key={code} title={step.title} locations={state.location ?? []} risks={risks} />;
        }
        if (mode === "assignment_table") {
          return <IntermediariesSection key={code} title={step.title} state={state} />;
        }
        if (mode === "file_form") {
          return <DocumentsSection key={code} title={step.title} stepCode={code} state={state} />;
        }
        const fields = (step.fields ?? []).filter((field) => field.type !== "content");
        if (!fields.length) return null;
        return (
          <Section key={code} title={step.title}>
            <Details rows={fields.map((field) => [field.display_name, fieldText(state, code, field)])} />
          </Section>
        );
      })}
    </>
  );
}

function VulnerabilityResult({ entry }: { entry: CaseRiskEntry<PriorityActionsCaseResponse> }) {
  const result = entry.result;
  if (!result) {
    if (!entry.error) return <p className="text-fg/60">No Vulnerability Index results for this site yet.</p>;
    // The framework covers a list of countries; say so plainly.
    const uncovered = /available countries/i.test(entry.error);
    return (
      <Alert tone="warning">
        {uncovered
          ? "The Vulnerability Index doesn't cover this site's country yet."
          : `The Vulnerability Index couldn't be calculated for this site: ${entry.error}`}
      </Alert>
    );
  }
  const metrics = buildMetricsFromCase(result);
  const resilience = result.resilience_dominant_class ? prettifyRiskLabel(String(result.resilience_dominant_class)) : "—";

  return (
    <div className="space-y-4">
      <div className="break-inside-avoid">
        <ManagementActionsMap
          polygonWkt={result.geometry || ""}
          recommendationsPolygons={result.recommendations_polygons}
          recommendationsMeta={result.recommendations_meta}
          resiliencePolygons={result.resilience_polygons}
          resilienceMeta={result.resilience_meta}
          riskPolygons={result.risk_polygons}
          riskMeta={result.risk_meta}
        />
        <p className="mt-1 text-[11px] text-fg/50">Map: recommended management action zones. © OpenStreetMap contributors.</p>
      </div>

      <Details
        rows={[
          ["Biodiversity risk", `${metrics.riskLabel} (score ${metrics.riskScore} / 100)`],
          ["Dominant climate resilience", resilience],
        ]}
      />

      {metrics.recommendationCategories.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-fg">Recommended management actions</h3>
          {metrics.recommendationCategories.map((id) => {
            const meta = result.recommendations_meta[String(id)];
            if (!meta) return null;
            return (
              <div key={id} className="break-inside-avoid rounded-xl border border-fg/10 p-3">
                <p className="flex items-center gap-2 font-semibold text-fg">
                  <span
                    aria-hidden="true"
                    className="h-3 w-3 shrink-0 rounded-full [print-color-adjust:exact]"
                    style={{ backgroundColor: meta.color || "#6b7280" }}
                  />
                  {meta.label}
                </p>
                <p className="mt-1">{meta.description}</p>
                {meta.examples && (
                  <p className="mt-2 text-fg/65">
                    <span className="font-semibold text-fg/80">Example activities: </span>
                    {meta.examples}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {result.xai_summary?.detailed_explanation?.length > 0 && (
        <div className="break-inside-avoid space-y-2">
          <h3 className="text-sm font-semibold text-fg">Explanation</h3>
          {result.xai_summary.detailed_explanation.map((block, index) => (
            <p key={index} className="whitespace-pre-line leading-6">
              {explanationText(block)}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function SitesSection({
  title,
  locations,
  risks,
}: {
  title: string;
  locations: CaseLocationEntry[];
  risks: RiskState;
}) {
  if (!locations.length) {
    return (
      <Section title={title}>
        <p className="text-fg/60">No sites recorded.</p>
      </Section>
    );
  }
  return (
    <>
      {locations.map((location, index) => {
        const risk = risks.entries?.find((entry) => entry.location_id === location.case_location_id);
        const name = location.friendly_name || `Site ${index + 1}`;
        const mapWkt = locationMapWkt(location);
        const isPolygon = location.location_type === "polygon";
        return (
          <Section key={location.case_location_id} title={`${title}: ${name}`} keepTogether={false}>
            <div className="space-y-4">
              {/* The site itself, as drawn in the pathway. */}
              <div className="break-inside-avoid overflow-hidden rounded-xl border border-fg/10">
                {mapWkt ? (
                  <RiskMap polygonWkt={mapWkt} mode={location.location_type} readOnly heightClassName="h-[260px]" />
                ) : (
                  <div className="flex h-[120px] items-center justify-center text-fg/50">No geometry recorded.</div>
                )}
              </div>
              <Details
                rows={[
                  ["Type", isPolygon ? "Polygon" : "Point"],
                  ["Country", location.country?.name ?? "—"],
                  ...(isPolygon ? ([["Area", formatLocationArea(location)]] as [string, string][]) : []),
                  ...(location.notes ? ([["Notes", location.notes]] as [string, string][]) : []),
                ]}
              />
              <div className="break-inside-avoid">
                <p className="text-xs font-semibold uppercase tracking-wider text-fg/50">
                  {isPolygon ? "Polygon (WKT)" : "Coordinates"}
                </p>
                <p className="mt-1 whitespace-pre-wrap break-all rounded-lg bg-shade/20 p-2 font-mono text-[11px] leading-4 text-fg/75">
                  {formatLocationValue(location)}
                </p>
              </div>

              {isPolygon ? (
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent-300">Vulnerability Index</h3>
                  {risk ? (
                    <VulnerabilityResult entry={risk} />
                  ) : risks.loading ? (
                    <p className="text-fg/60">Loading the Vulnerability Index…</p>
                  ) : risks.error ? (
                    <Alert tone="warning">The Vulnerability Index couldn&apos;t be loaded: {risks.error}</Alert>
                  ) : (
                    <p className="text-fg/60">No Vulnerability Index results for this site yet.</p>
                  )}
                </div>
              ) : (
                <p className="text-fg/60">The Vulnerability Index is assessed for sites drawn as polygons.</p>
              )}
            </div>
          </Section>
        );
      })}
    </>
  );
}

function IntermediariesSection({ title, state }: { title: string; state: CaseDashboardState }) {
  const rows = Array.isArray(state.intermediary) ? (state.intermediary as Record<string, unknown>[]) : [];
  return (
    <Section title={title}>
      {!rows.length && <p className="text-fg/60">No intermediaries assigned.</p>}
      {rows.length > 0 && (
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-fg/10 text-xs uppercase tracking-wider text-fg/50">
              <th scope="col" className="py-2 pr-4 font-semibold">Intermediary</th>
              <th scope="col" className="py-2 font-semibold">Function</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-fg/10">
            {rows.map((row, index) => (
              <tr key={index} className="break-inside-avoid">
                <td className="py-2 pr-4 font-semibold text-fg">{getObjectLabel(row.intermediary)}</td>
                <td className="py-2 text-fg/80">{getObjectLabel(row.intermediary_function)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Section>
  );
}

function DocumentsSection({ title, stepCode, state }: { title: string; stepCode: string; state: CaseDashboardState }) {
  const documents = (state.documents ?? []).filter((doc) => doc.step_code === stepCode);
  return (
    <Section title={title}>
      {!documents.length && <p className="text-fg/60">No document uploaded.</p>}
      <ul className="divide-y divide-fg/10">
        {documents.map((doc) => (
          <li key={doc.case_document_id} className="py-2">
            <p className="font-semibold text-fg">{doc.original_filename}</p>
            <p className="text-fg/60">Uploaded {formatDate(doc.created_at)}</p>
            {doc.notes && <p className="mt-1">{doc.notes}</p>}
          </li>
        ))}
      </ul>
      {documents.length > 0 && (
        <p className="mt-3 text-xs text-fg/50">The files themselves are in the project, for people with access to it.</p>
      )}
    </Section>
  );
}

/**
 * A printable summary of one project (Export tab): its steps in the
 * pathway's order, with each site's Vulnerability Index results. "Print or save as PDF" uses the browser's print dialog; the
 * page prints in light mode on A4, without the site's header and footer.
 */
export default function ProjectSummaryPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const { data: state, error } = useCaseDashboard(caseId);
  const riskQuery = useCaseRisk(caseId);
  const risks: RiskState = {
    entries: riskQuery.data,
    loading: riskQuery.isPending,
    error: riskQuery.error ? riskQuery.error.message || "please try again later." : null,
  };
  usePrintInLightMode();

  if (error) return <Alert tone="danger">{error.message || "Could not load the project."}</Alert>;
  if (!state) return <p className="text-sm text-fg/60">Loading summary…</p>;

  const basicInfo = getStepData(state, "basic_info");
  const name = typeof basicInfo?.name === "string" && basicInfo.name ? basicInfo.name : `Project #${state.caseId}`;
  const isBng = state.caseType.startsWith("bng_");

  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-10 print:max-w-none print:space-y-4 print:pb-0">
      <style>{"@page { size: A4; margin: 14mm; }"}</style>

      <div className="flex flex-wrap justify-end gap-3 print:hidden">
        <Link href={`/projects/${state.caseId}/export`} className={buttonClass("secondary")}>
          Back to project
        </Link>
        <button type="button" onClick={() => window.print()} className={`${buttonClass("primary")} gap-2`}>
          <Printer className="h-4 w-4" aria-hidden="true" />
          Print or save as PDF
        </button>
      </div>

      <header className="flex items-start justify-between gap-6 border-b border-fg/10 pb-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-300">Project summary</p>
          <h1 className="text-3xl font-semibold tracking-tight text-fg">{name}</h1>
          <p className="text-sm text-fg/65">
            {state.caseTypeName ?? state.caseType} · Project #{state.caseId} · {prettifyRiskLabel(state.status.replace(/_/g, "-"))}
          </p>
          <p className="text-xs text-fg/50">
            Created {formatDate(state.createdAt)} · Last updated {formatDate(state.updatedAt)} · Generated{" "}
            {formatDate(new Date().toISOString())}
          </p>
        </div>
        <Image src="/biofin-logo-final.png" alt="BIOFIN-EU" width={140} height={56} className="h-12 w-auto object-contain" />
      </header>

      {isBng && (
        <Alert tone="info" className="print:hidden">
          For the biodiversity metric, units and allocations, see the{" "}
          <Link href={`/bng/report/${state.caseId}`} className="font-semibold underline">
            BNG report
          </Link>
          .
        </Alert>
      )}

      <StepSections state={state} risks={risks} />

      <footer className="break-inside-avoid space-y-1 border-t border-fg/10 pt-4 text-xs leading-5 text-fg/50">
        <p>
          This summary reflects the project&apos;s data on the date it was generated. Vulnerability Index results come from
          the BIOFIN-EU Risk Score Framework.
          {isBng && " BNG pathways use a simplified prototype metric, not the Statutory Biodiversity Metric."}
        </p>
        <p>
          BIOFIN-EU has received funding from the European Union&apos;s Horizon Europe research and innovation programme under
          Grant Agreement no. 101135476.
        </p>
      </footer>
    </div>
  );
}
