"use client";

import { useMemo } from "react";
import { workflowService } from "@/services/workflow.service";
import type { WorkflowState } from "@/types/workflow";
import { FormRenderer } from "@/components/FormRenderer";

type Props = {
  state: WorkflowState;
  onStateUpdated: (state: WorkflowState) => void;
};

function prettifyLabel(name: string) {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function WorkflowFormStep({ state, onStateUpdated }: Props) {
  const step = state.step;

  if (!step) {
    return <p className="text-sm text-white/70">No step available.</p>;
  }

  const stepSchema = useMemo(
    () => ({
      title: step.title,
      fields: step.fields.map((f) => ({
        id: f.name,
        label: prettifyLabel(f.name),
        type: f.type as any,
        required: !!f.required,
        options: Array.isArray(f.options) ? f.options : [],
      })),
    }),
    [step]
  );

  const defaultValues = useMemo(() => {
    const values: Record<string, any> = {};

    step.fields.forEach((f) => {
      values[f.name] = f.default ?? "";
    });

    return values;
  }, [step]);

  async function handleNext(values: Record<string, any>) {
    const updated = await workflowService.submitJsonStep(state.case_id, values);
    onStateUpdated(updated);
  }

  async function handleSaveDraft(_values: Record<string, any>) {
    return;
  }

  return (
    <FormRenderer
      stepSchema={stepSchema}
      defaultValues={defaultValues}
      onNext={handleNext}
      onSaveDraft={handleSaveDraft}
      isFirst={false}
      isLast={!step.next}
    />
  );
}