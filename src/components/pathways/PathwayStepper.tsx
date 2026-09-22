"use client";

import type { DashboardStep, DashboardWorkflowConfig } from "@/types/workflow";

export type PathwayStepStatus = "done" | "current" | "upcoming";

export type OrderedStep = {
  code: string;
  title: string;
  status: PathwayStepStatus;
};

function isStepDataFilled(
  workflowConfig: DashboardWorkflowConfig,
  payload: Record<string, unknown>,
  code: string
): boolean {
  const step: DashboardStep | undefined = workflowConfig.steps?.[code];

  // Multi-location steps store their committed data under the top-level
  // `location` key regardless of the step's own code, mirroring how the
  // project dashboard reads it.
  if (step?.ui_mode === "location_table") {
    const locations = payload.location;
    return Array.isArray(locations) && locations.length > 0;
  }

  // File-upload steps have no payload[stepCode] entry at all - their
  // committed data lives in the top-level `documents` array, matched by
  // step_code, same as ProjectDashboardScreen's file-field handling.
  if (step?.ui_mode === "file_form") {
    const documents = payload.documents;
    return (
      Array.isArray(documents) &&
      documents.some(
        (doc) => doc && typeof doc === "object" && (doc as any).step_code === code
      )
    );
  }

  const value = payload[code];

  if (value == null) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;

  return Boolean(value);
}

export function buildOrderedSteps(
  workflowConfig: DashboardWorkflowConfig | null | undefined,
  payload: Record<string, unknown>,
  currentStepCode: string
): OrderedStep[] {
  if (!workflowConfig) return [];

  const ordered: OrderedStep[] = [];
  const visited = new Set<string>();

  let code: string | null | undefined = workflowConfig.start_step;

  while (code && !visited.has(code)) {
    visited.add(code);

    const step: DashboardStep | undefined = workflowConfig.steps?.[code];
    if (!step) break;

    const status: PathwayStepStatus =
      code === currentStepCode
        ? "current"
        : isStepDataFilled(workflowConfig, payload, code)
          ? "done"
          : "upcoming";

    ordered.push({ code, title: step.title, status });
    code = step.next ?? null;
  }

  return ordered;
}

type Props = {
  workflowConfig: DashboardWorkflowConfig | null | undefined;
  payload: Record<string, unknown>;
  currentStepCode: string;
  activeStepCode: string;
  onSelectStep: (stepCode: string) => void;
};

export function PathwayStepper({
  workflowConfig,
  payload,
  currentStepCode,
  activeStepCode,
  onSelectStep,
}: Props) {
  const steps = buildOrderedSteps(workflowConfig, payload, currentStepCode);

  if (steps.length === 0) return null;

  return (
    <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md lg:sticky lg:top-24">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
        Steps
      </p>

      <div className="mt-4 space-y-2">
        {steps.map((item, index) => {
          const isActive = item.code === activeStepCode;
          const isClickable = item.status === "done" || item.status === "current";

          return (
            <button
              key={item.code}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onSelectStep(item.code)}
              className={[
                "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition",
                isActive
                  ? "border-emerald-400/40 bg-emerald-500/10"
                  : isClickable
                    ? "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                    : "cursor-not-allowed border-white/5 bg-black/10 opacity-50",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                  item.status === "done"
                    ? "bg-emerald-400 text-emerald-950"
                    : item.status === "current"
                      ? "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/40"
                      : "bg-white/10 text-white/40",
                ].join(" ")}
              >
                {item.status === "done" ? "✓" : index + 1}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-white">
                  {item.title}
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-white/40">
                  {item.status === "current"
                    ? "In progress"
                    : item.status === "done"
                      ? "Completed"
                      : "Upcoming"}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
