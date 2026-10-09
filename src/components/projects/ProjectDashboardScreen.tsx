"use client";

import { useEffect, useMemo, useState } from "react";
import RiskMap from "@/components/maps/RiskMap";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { FieldHelp } from "@/components/ui/FieldHelp";
import { isoToDisplay } from "@/components/ui/DatePicker";
import { AllocationsCard, HabitatParcelsCard } from "@/components/bng/BngDashboardCards";
import { BngMetricPanel } from "@/components/bng/BngMetricPanel";
import type { BngMetricSummary } from "@/types/bng";
import type { CaseDashboardState } from "@/types/case-dashboard";
import type { CaseLocationEntry } from "@/types/case-location";
import type { CaseDocument } from "@/types/case-document";
import type { WorkflowField, WorkflowStep } from "@/types/workflow";
import { Badge } from "@/components/ui/Badge";

type OrderedStep = {
  code: string;
  step: WorkflowStep;
};

function getOrderedSteps(state: CaseDashboardState): OrderedStep[] {
  const workflow = state.workflow_config;
  const ordered: OrderedStep[] = [];
  const visited = new Set<string>();

  let currentCode: string | null | undefined = workflow?.start_step;

  while (currentCode && !visited.has(currentCode)) {
    visited.add(currentCode);

    const step: WorkflowStep | undefined = workflow.steps?.[currentCode];
    if (!step) break;

    ordered.push({ code: currentCode, step });
    currentCode = step.next;
  }

  return ordered;
}

function getStepData(
  state: CaseDashboardState,
  stepCode: string
): Record<string, unknown> | null {
  const value = state[stepCode];

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function getFieldValue(
  state: CaseDashboardState,
  stepData: Record<string, unknown> | null,
  field: WorkflowField,
  stepCode: string
): unknown {
    // Temporary workaround until consent is stored
  if (field.name === "disclaimer_acknowledged") {
    return "Agreed";
  }

    if (field.name === "allow_data_sharing") {
    return "Accepted";
  }

  // Hide static content fields from dashboard rendering
  if (field.type === "content") {
    return null;
  }

  if (stepData && field.name in stepData) {
    return stepData[field.name] ?? null;
  }

  if (stepData && field.name.endsWith("_id")) {
    const baseName = field.name.replace(/_id$/, "");
    const nested = stepData[baseName];

    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      const nestedRecord = nested as Record<string, unknown>;
      return nestedRecord.name ?? nestedRecord.code ?? nestedRecord.id ?? null;
    }
  }

  if (field.type === "file" && Array.isArray(state.documents)) {
    const matchingDoc = state.documents.find((doc) => {
      return doc.field_name === field.name && doc.step_code === stepCode;
    });

    if (matchingDoc) {
      return matchingDoc.original_filename ?? matchingDoc.upload_token ?? null;
    }
  }

  // A file step's notes are saved with its document.
  if (field.name === "document_notes" && Array.isArray(state.documents)) {
    return state.documents.find((doc) => doc.step_code === stepCode)?.notes ?? null;
  }

  return null;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (Array.isArray(value)) {
    return value.length ? value.map(String).join(", ") : "—";
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (record.name) return String(record.name);
    if (record.code) return String(record.code);
    return JSON.stringify(record, null, 2);
  }

  return String(value);
}

function isFilled(value: unknown): boolean {
  return value !== null && value !== undefined && value !== "";
}

function isStepComplete(
  state: CaseDashboardState,
  orderedStep: OrderedStep
): boolean {
  if (orderedStep.step.ui_mode === "assignment_table") {
    const value = state[orderedStep.code];
    return Array.isArray(value) && value.length > 0;
  }

  if (orderedStep.step.ui_mode === "location_table") {
    return Array.isArray(state.location) && state.location.length > 0;
  }

  // Biodiversity Net Gain steps
  if (orderedStep.step.ui_mode === "habitat_table") {
    const value = state[orderedStep.code];
    return Array.isArray(value) && value.length > 0;
  }

  if (orderedStep.step.ui_mode === "bng_allocation") {
    return state[orderedStep.code] != null;
  }

  const requiredFields = (orderedStep.step.fields || []).filter(
    (field) => field.required
  );

  if (!requiredFields.length) return true;

  const stepData = getStepData(state, orderedStep.code);

  return requiredFields.every((field) =>
    isFilled(getFieldValue(state, stepData, field, orderedStep.code))
  );
}

function locationMapWkt(location: CaseLocationEntry): string {
  if (location.location_type === "polygon") {
    return location.geometry_wkt ?? "";
  }

  if (location.latitude != null && location.longitude != null) {
    return `POINT(${location.longitude} ${location.latitude})`;
  }

  return "";
}

function formatLocationArea(location: CaseLocationEntry): string {
  if (location.area_hectares == null) return "—";

  const ha = location.area_hectares.toLocaleString(undefined, {
    maximumFractionDigits: 4,
  });

  if (location.area_sqm == null) return `${ha} ha`;

  const sqm = location.area_sqm.toLocaleString(undefined, {
    maximumFractionDigits: 1,
  });

  return `${ha} ha (${sqm} sqm)`;
}

function formatLocationValue(location: CaseLocationEntry): string {
  if (location.location_type === "point") {
    if (location.latitude == null || location.longitude == null) return "—";
    return `Lat: ${location.latitude}, Long: ${location.longitude}`;
  }

  return location.geometry_wkt?.trim() || "—";
}

function LocationCard({
  location,
  index,
}: {
  location: CaseLocationEntry;
  index: number;
}) {
  const mapWkt = locationMapWkt(location);

  return (
    <div className="rounded-xl surface-card p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-fg">
          {location.friendly_name?.trim() || `Location ${index + 1}`}
        </p>

        <Badge size="md">{location.location_type}</Badge>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-fg/10">
        {mapWkt ? (
          <RiskMap
            polygonWkt={mapWkt}
            mode={location.location_type}
            readOnly
            heightClassName="h-[220px]"
          />
        ) : (
          <div className="flex h-[220px] items-center justify-center bg-shade/30 text-sm text-fg/40">
            No geometry
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-medium text-fg/40">Country</p>
          <p className="mt-1 text-sm text-fg/80">
            {location.country?.name ?? "—"}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-fg/40">Area</p>
          <p className="mt-1 text-sm text-fg/80">
            {formatLocationArea(location)}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-xs font-medium text-fg/40">
          {location.location_type === "polygon" ? "Polygon WKT" : "Coordinates"}
        </p>
        <p className="mt-1 max-h-24 overflow-y-auto whitespace-pre-wrap break-words rounded-lg bg-shade/30 p-2 font-mono text-xs text-fg/70">
          {formatLocationValue(location)}
        </p>
      </div>

      {location.notes && (
        <div className="mt-3">
          <p className="text-xs font-medium text-fg/40">Notes</p>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-fg/70">
            {location.notes}
          </p>
        </div>
      )}
    </div>
  );
}

function LocationsSection({ locations }: { locations: CaseLocationEntry[] }) {
  if (!locations.length) {
    return (
      <div className="rounded-xl surface-card p-4 text-sm text-fg/50 md:col-span-2">
        No locations found.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
      {locations.map((location, index) => (
        <LocationCard
          key={location.case_location_id ?? index}
          location={location}
          index={index}
        />
      ))}
    </div>
  );
}

function DocumentFieldCard({
  field,
  caseId,
  document,
}: {
  field: WorkflowField;
  caseId: number | string;
  document: CaseDocument | undefined;
}) {
  return (
    <div className="rounded-xl surface-card p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-fg">{field.display_name}</p>
          <FieldHelp text={field.help_text} label={field.display_name} />
        </span>

        {field.required && (
          <Badge tone="warning" size="md">Required</Badge>
        )}
      </div>

      <div className="mt-3">
        {document ? (
          <DocumentCard caseId={caseId} document={document} />
        ) : (
          <p className="text-sm text-fg/50">No file uploaded.</p>
        )}
      </div>
    </div>
  );
}

function StandardFieldCard({
  field,
  value,
}: {
  field: WorkflowField;
  value: unknown;
}) {
  return (
    <div className="rounded-xl surface-card p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-fg">{field.display_name}</p>
          <FieldHelp text={field.help_text} label={field.display_name} />
        </span>

        {field.required && (
          <Badge tone="warning" size="md">Required</Badge>
        )}
      </div>

      <p className="mt-3 break-words text-sm text-fg/70">
        {field.type === "date" && typeof value === "string" && value
          ? isoToDisplay(value)
          : formatValue(value)}
      </p>
    </div>
  );
}

function getObjectLabel(value: unknown): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "—";
  }

  const record = value as Record<string, unknown>;

  return String(record.name ?? record.code ?? record.id ?? "—");
}

function AssignmentTableCard({ assignments }: { assignments: unknown[] }) {
  if (!assignments.length) {
    return (
      <div className="rounded-xl surface-card p-4 text-sm text-fg/50 md:col-span-2">
        No assignments found.
      </div>
    );
  }

  return (
    <div className="space-y-3 md:col-span-2">
      {assignments.map((item, index) => {
        const values =
          item && typeof item === "object" && !Array.isArray(item)
            ? Object.values(item).filter(
                (value) =>
                  value && typeof value === "object" && !Array.isArray(value)
              )
            : [];

        const assignee = values[0];
        const role = values[1];

        return (
          <div
            key={index}
            className="rounded-xl surface-card p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-fg/40">
              Assignment {index + 1}
            </p>

            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-fg">
                  Assigned Entity
                </p>
                <p className="mt-1 text-sm text-fg/70">
                  {getObjectLabel(assignee)}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-fg">Role</p>
                <p className="mt-1 text-sm text-fg/70">
                  {getObjectLabel(role)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ProjectDashboardScreen({ state }: { state: CaseDashboardState }) {
  const orderedSteps = useMemo(() => getOrderedSteps(state), [state]);
  const [activeStepCode, setActiveStepCode] = useState<string>("");

  useEffect(() => {
    setActiveStepCode(orderedSteps[0]?.code ?? "");
  }, [orderedSteps]);

  const activeStep =
    orderedSteps.find((item) => item.code === activeStepCode) ?? orderedSteps[0];

  if (!activeStep) {
    return (
      <div className="rounded-2xl surface-panel p-4 sm:p-6 text-fg/70">
        No workflow steps found.
      </div>
    );
  }

  const activeStepData = getStepData(state, activeStep.code);
  const completedSteps = orderedSteps.filter((item) =>
    isStepComplete(state, item)
  ).length;

  const activeStepValue = state[activeStep.code];
  const assignments = Array.isArray(activeStepValue) ? activeStepValue : [];

  return (
    <section className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="h-fit rounded-2xl surface-panel p-4 sm:p-5 shadow-panel lg:sticky lg:top-24">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-fg/50">
            Steps
          </p>

          <p className="text-xs text-fg/40">
            {completedSteps}/{orderedSteps.length}
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {orderedSteps.map((item, index) => {
            const active = item.code === activeStep.code;
            const complete = isStepComplete(state, item);

            return (
              <button
                key={item.code}
                type="button"
                onClick={() => setActiveStepCode(item.code)}
                className={[
                  "w-full rounded-xl border p-4 text-left transition",
                  active
                    ? "border-accent-400/40 bg-accent-500/10"
                    : "border-fg/10 bg-shade/20 hover:bg-fg/[0.06]",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-fg/40">
                      Step {index + 1}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-fg">
                      {item.step.title}
                    </p>
                  </div>

                  <Badge tone={complete ? "success" : "neutral"} size="md">
                    {complete ? "Complete" : "Pending"}
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="min-h-[360px] min-w-0 rounded-2xl surface-panel p-4 sm:p-6 shadow-panel">
        <h2 className="text-2xl font-semibold tracking-tight text-fg">
          {activeStep.step.title}
        </h2>

        {/* The metric as the step showed it (what happened after is on the BNG tab). */}
        {activeStep.step.ui_mode === "bng_metric" && (
          <div className="mt-6">
            <BngMetricPanel summary={state.bng_metric as BngMetricSummary | undefined} scope="workflow" />
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {activeStep.step.ui_mode === "assignment_table" ? (
            <AssignmentTableCard assignments={assignments} />
          ) : activeStep.step.ui_mode === "location_table" ? (
            <LocationsSection locations={state.location ?? []} />
          ) : activeStep.step.ui_mode === "habitat_table" ? (
            <div className="md:col-span-2">
              <HabitatParcelsCard parcels={state[activeStep.code]} />
            </div>
          ) : activeStep.step.ui_mode === "bng_allocation" ? (
            <div className="md:col-span-2">
              <AllocationsCard data={state[activeStep.code]} />
            </div>
          ) : (
            (activeStep.step.fields || [])
            .filter((field) => field.type !== "content")
            .map((field) => {
              if (field.type === "file") {
                const document = (state.documents ?? []).find(
                  (doc) =>
                    doc.field_name === field.name &&
                    doc.step_code === activeStep.code
                );

                return (
                  <DocumentFieldCard
                    key={field.name}
                    field={field}
                    caseId={state.caseId}
                    document={document}
                  />
                );
              }

              const value = getFieldValue(
                state,
                activeStepData,
                field,
                activeStep.code
              );

              return (
                <StandardFieldCard
                  key={field.name}
                  field={field}
                  value={value}
                />
              );
            })
          )}
        </div>

        {(!activeStep.step.fields || activeStep.step.fields.length === 0) && (
          <div className="mt-6 rounded-xl surface-card p-4 text-sm text-fg/50">
            No fields configured for this step.
          </div>
        )}
      </div>
    </section>
  );
}