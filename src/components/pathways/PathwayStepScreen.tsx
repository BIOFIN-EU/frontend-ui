"use client";

import Link from "next/link";
import type { WorkflowState, WorkflowStep } from "@/types/case-dashboard";
import { PathwayFormStep } from "./PathwayFormStep";
import { PathwayFileStep } from "./PathwayFileStep";
import { PathwayAssignmentStep } from "./PathwayAssignmentStep";
import { PathwayLocationStep } from "./PathwayLocationStep";
import { buttonBase, buttonPrimary } from "@/lib/ui";

export type PathwayStepMode = "submit" | "edit";

type Props = {
  state: WorkflowState;
  onStateUpdated: (state: WorkflowState) => void;
  onReload: () => Promise<void>;
  /** Step config to render. Defaults to `state.step` (the live current step). */
  stepConfig?: WorkflowStep | null;
  /** Step code matching `stepConfig`. Defaults to `state.current_step`. */
  stepCode?: string;
  /** "submit" advances the live workflow; "edit" updates a past step in place. */
  mode?: PathwayStepMode;
  /** Committed-or-draft values to prefill the step's form with. */
  initialValues?: unknown;
  /** Called after a successful edit-mode save. */
  onEditSaved?: () => void;
  /** Navigate to the immediately-previous step, if any. */
  onBack?: () => void;
  /** True when there is no previous step to go back to. */
  isFirstStep?: boolean;
};

function inferMode(step: WorkflowStep) {
  if (step.fields.some((f) => f.type === "file")) return "file_form";
  if (
    step.fields.some(
      (f) => f.type === "location_table" || f.name === "locations"
    )
  )
    return "location_table";
  if (step.fields.some((f) => f.type === "assignment_table"))
    return "assignment_table";

  return "form";
}

export function PathwayStepScreen({
  state,
  onStateUpdated,
  onReload,
  stepConfig = null,
  stepCode,
  mode = "submit",
  initialValues = null,
  onEditSaved,
  onBack,
  isFirstStep = true,
}: Props) {
  if (mode === "submit" && (state.status === "completed" || !state.step)) {
    return (
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200/80">
              Completed
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              Your project has been created successfully
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-white/75">
              You have completed all required steps. You can now open your project
              dashboard to review the submitted information, documents, and next
              steps.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href={`/projects/${state.case_id}`}
              className={`${buttonBase} ${buttonPrimary}`}
            >
              View project #{state.case_id}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const step = stepConfig ?? state.step;

  if (!step) {
    return <p className="text-sm text-white/70">No step available.</p>;
  }

  const effectiveStepCode = stepCode ?? state.current_step;
  const uiMode = step.ui_mode ?? inferMode(step);

  const commonProps = {
    state,
    step,
    stepCode: effectiveStepCode,
    mode,
    initialValues,
    onStateUpdated,
    onEditSaved,
    onBack,
    isFirstStep,
  };

  if (uiMode === "location_table") {
    return <PathwayLocationStep {...commonProps} />;
  }

  if (uiMode === "file_form") {
    return <PathwayFileStep {...commonProps} />;
  }

  if (uiMode === "assignment_table") {
    return <PathwayAssignmentStep {...commonProps} />;
  }

  return <PathwayFormStep {...commonProps} />;
}
