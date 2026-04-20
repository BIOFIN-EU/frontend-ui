"use client";

import { useEffect, useMemo, useState } from "react";
import RiskMap from "@/components/maps/RiskMap";
import type {
  CaseDashboardState,
  DashboardField,
  DashboardStep,
} from "@/types/workflow";
import { formatDate } from "@/lib/format";

type OrderedStep = {
  code: string;
  step: DashboardStep;
};

function getOrderedSteps(state: CaseDashboardState): OrderedStep[] {
  const workflow = state.workflow_config;
  const ordered: OrderedStep[] = [];
  const visited = new Set<string>();

  let currentCode: string | null | undefined = workflow?.start_step;

  while (currentCode && !visited.has(currentCode)) {
    visited.add(currentCode);

    const step = workflow.steps?.[currentCode];
    if (!step) break;

    ordered.push({
      code: currentCode,
      step,
    });

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
  field: DashboardField,
  stepCode: string
): unknown {
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
      return (
        doc.field_name === field.name &&
        doc.step_code === stepCode
      );
    });

    if (matchingDoc) {
      return matchingDoc.original_filename ?? matchingDoc.upload_token ?? null;
    }
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

function isStepComplete(state: CaseDashboardState, orderedStep: OrderedStep): boolean {
  const requiredFields = (orderedStep.step.fields || []).filter((field) => field.required);

  if (!requiredFields.length) return true;

  const stepData = getStepData(state, orderedStep.code);

  return requiredFields.every((field) =>
    isFilled(getFieldValue(state, stepData, field, orderedStep.code))
  );
}

function PolygonFieldCard({
  field,
  value,
  mapKey,
}: {
  field: DashboardField;
  value: unknown;
  mapKey: string;
}) {
  const polygonWkt = typeof value === "string" ? value : "";

  return (
    <div className="space-y-4 md:col-span-2">
      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-white">{field.display_name}</p>

          {field.required && (
            <span className="rounded-full bg-amber-500/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-200 ring-1 ring-amber-400/25">
              Required
            </span>
          )}
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
          <RiskMap
            key={mapKey}
            polygonWkt={polygonWkt}
          />
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="text-sm font-medium text-white">Polygon WKT</p>
        <pre className="mt-3 whitespace-pre-wrap break-words text-sm text-white/70">
          {polygonWkt || "—"}
        </pre>
      </div>
    </div>
  );
}

function StandardFieldCard({
  field,
  value,
}: {
  field: DashboardField;
  value: unknown;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-white">{field.display_name}</p>

        {field.required && (
          <span className="rounded-full bg-amber-500/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-200 ring-1 ring-amber-400/25">
            Required
          </span>
        )}
      </div>

      <p className="mt-3 break-words text-sm text-white/70">
        {formatValue(value)}
      </p>
    </div>
  );
}

export function CaseDashboardScreen({ state }: { state: CaseDashboardState }) {
  const orderedSteps = useMemo(() => getOrderedSteps(state), [state]);
  const [activeStepCode, setActiveStepCode] = useState<string>("");

  useEffect(() => {
    setActiveStepCode(orderedSteps[0]?.code ?? "");
  }, [orderedSteps]);

  const activeStep =
    orderedSteps.find((item) => item.code === activeStepCode) ?? orderedSteps[0];

  if (!activeStep) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 text-white/70">
        No workflow steps found.
      </div>
    );
  }

  const activeStepData = getStepData(state, activeStep.code);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Case summary
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              #{state.caseId}
            </h1>
          </div>

          <div className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/25">
            {state.status}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-wider text-white/50">Case type</p>
            <p className="mt-2 text-sm text-white/90">{state.caseType}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-wider text-white/50">Created at</p>
            <p className="mt-2 text-sm text-white/90">{formatDate(state.createdAt)}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-wider text-white/50">Updated at</p>
            <p className="mt-2 text-sm text-white/90">{formatDate(state.updatedAt)}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
            Steps
          </p>

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
                      ? "border-emerald-400/40 bg-emerald-500/10"
                      : "border-white/10 bg-black/20 hover:bg-white/[0.06]",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                        Step {index + 1}
                      </p>
                      <p className="mt-1 text-sm font-medium text-white">
                        {item.step.title}
                      </p>
                    </div>

                    <div
                      className={[
                        "rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider",
                        complete
                          ? "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/25"
                          : "bg-white/10 text-white/60 ring-1 ring-white/10",
                      ].join(" ")}
                    >
                      {complete ? "Complete" : "Pending"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            {activeStep.step.title}
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {(activeStep.step.fields || []).map((field) => {
              const value = getFieldValue(state, activeStepData, field, activeStep.code);

              if (field.name === "polygon_wkt") {
                return (
                  <PolygonFieldCard
                    key={field.name}
                    field={field}
                    value={value}
                    mapKey={`${state.caseId}-${activeStep.code}-${field.name}`}
                  />
                );
              }

              return (
                <StandardFieldCard
                  key={field.name}
                  field={field}
                  value={value}
                />
              );
            })}
          </div>

          {(!activeStep.step.fields || activeStep.step.fields.length === 0) && (
            <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/50">
              No fields configured for this step.
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
            Documents
          </p>

          <div className="mt-4 space-y-2">
            {state.documents?.length ? (
              state.documents.map((doc) => (
                <div
                  key={doc.case_document_id}
                  className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white/80"
                >
                  <p className="font-medium text-white">{doc.original_filename}</p>
                  <p className="mt-1 text-xs text-white/50">
                    Step: {doc.step_code} · Field: {doc.field_name}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/50">No documents uploaded</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
            Workflow config
          </p>

          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-white/80">
              <span className="font-medium text-white">Workflow code:</span>{" "}
              {state.workflow_config.code}
            </p>
            <p className="mt-2 text-sm text-white/80">
              <span className="font-medium text-white">Start step:</span>{" "}
              {state.workflow_config.start_step}
            </p>
            <p className="mt-2 text-sm text-white/80">
              <span className="font-medium text-white">Step count:</span>{" "}
              {orderedSteps.length}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}