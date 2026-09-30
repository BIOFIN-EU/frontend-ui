"use client";

import { Fragment } from "react";

import type { WorkflowConfig, WorkflowStep } from "@/types/workflow";

export type PathwayStepStatus = "done" | "current" | "upcoming";

export type OrderedStep = {
  code: string;
  title: string;
  status: PathwayStepStatus;
  stage?: string;
  actor?: string;
};

function isStepDataFilled(
  workflowConfig: WorkflowConfig,
  payload: Record<string, unknown>,
  code: string
): boolean {
  const step: WorkflowStep | undefined = workflowConfig.steps?.[code];

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
  workflowConfig: WorkflowConfig | null | undefined,
  payload: Record<string, unknown>,
  currentStepCode: string
): OrderedStep[] {
  if (!workflowConfig) return [];

  const ordered: OrderedStep[] = [];
  const visited = new Set<string>();

  let code: string | null | undefined = workflowConfig.start_step;

  while (code && !visited.has(code)) {
    visited.add(code);

    const step: WorkflowStep | undefined = workflowConfig.steps?.[code];
    if (!step) break;

    const status: PathwayStepStatus =
      code === currentStepCode
        ? "current"
        : isStepDataFilled(workflowConfig, payload, code)
          ? "done"
          : "upcoming";

    ordered.push({ code, title: step.title, status, stage: step.stage, actor: step.actor });
    code = step.next ?? null;
  }

  return ordered;
}

type Props = {
  workflowConfig: WorkflowConfig | null | undefined;
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
    <aside className="h-fit rounded-2xl surface-panel p-5 shadow-panel lg:sticky lg:top-24">
      <p className="text-xs font-semibold uppercase tracking-wider text-fg/50">
        Steps
      </p>

      <div className="mt-4 space-y-2">
        {steps.map((item, index) => {
          const isActive = item.code === activeStepCode;
          const isClickable = item.status === "done" || item.status === "current";
          // Heading when the stage changes (steps without a stage get none).
          const stageHeading =
            item.stage && item.stage !== steps[index - 1]?.stage ? item.stage : null;

          return (
            <Fragment key={item.code}>
              {stageHeading && (
                <p className="pt-2 text-[11px] font-semibold uppercase tracking-wider text-accent-200/80">
                  {stageHeading}
                </p>
              )}
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onSelectStep(item.code)}
              className={[
                "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition",
                isActive
                  ? "border-accent-400/40 bg-accent-500/10"
                  : isClickable
                    ? "border-fg/10 bg-shade/20 hover:bg-fg/[0.06]"
                    : "cursor-not-allowed border-fg/5 bg-shade/10 opacity-50",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                  item.status === "done"
                    ? "bg-accent-400 text-accent-950"
                    : item.status === "current"
                      ? "bg-accent-500/20 text-accent-200 ring-1 ring-accent-400/40"
                      : "bg-fg/10 text-fg/40",
                ].join(" ")}
              >
                {item.status === "done" ? "✓" : index + 1}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-fg">
                  {item.title}
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-fg/40">
                  {item.status === "current"
                    ? "In progress"
                    : item.status === "done"
                      ? "Completed"
                      : "Upcoming"}
                </span>
              </span>
            </button>
            </Fragment>
          );
        })}
      </div>
    </aside>
  );
}
