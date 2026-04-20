"use client";

import Link from "next/link";
import type { WorkflowState } from "@/types/case-dashboard";
import { WorkflowFormStep } from "./WorkflowFormStep";
import { WorkflowFileStep } from "./WorkflowFileStep";
import { WorkflowMapStep } from "./WorkflowMapStep";

type Props = {
  state: WorkflowState;
  onStateUpdated: (state: WorkflowState) => void;
  onReload: () => Promise<void>;
};

function inferMode(step: WorkflowState["step"]) {
  if (!step) return "form";

  if (step.fields.some((f) => f.type === "file")) return "file_form";
  if (step.fields.some((f) => f.name === "polygon_wkt")) return "map_form";

  return "form";
}

export function WorkflowStepScreen({
  state,
  onStateUpdated,
  onReload,
}: Props) {
  if (state.status === "completed" || !state.step) {
    return (
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200/80">
              Completed
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              Your case has been created successfully
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-white/75">
              You have completed all required steps. You can now open your case
              dashboard to review the submitted information, documents, and next
              steps.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href={`/cases/${state.case_id}`}
              className="inline-flex items-center rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300"
            >
              View case #{state.case_id}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const step = state.step;
  const mode = step.ui_mode ?? inferMode(step);

  if (mode === "map_form") {
    return (
      <WorkflowMapStep
        state={state}
        onStateUpdated={onStateUpdated}
      />
    );
  }

  if (mode === "file_form") {
    return (
      <WorkflowFileStep
        state={state}
        onStateUpdated={onStateUpdated}
      />
    );
  }

  return (
    <WorkflowFormStep
      state={state}
      onStateUpdated={onStateUpdated}
    />
  );
}