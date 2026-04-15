"use client";

import type { WorkflowState } from "@/types/workflow";
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
    return <p className="text-white/70">Workflow complete</p>;
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