"use client";

import { useMemo, useState } from "react";
import { workflowService } from "@/services/workflow.service";
import type { WorkflowState } from "@/types/workflow";
import { FormRenderer } from "@/components/FormRenderer";

type Props = {
  state: WorkflowState;
  onStateUpdated: (state: WorkflowState) => void;
};

export function PathwayFileStep({ state, onStateUpdated }: Props) {
  const step = state.step;

  if (!step) {
    return <p className="text-sm text-white/70">No step available.</p>;
  }

  const fileField = step.fields.find((f) => f.type === "file");
  const [error, setError] = useState("");

  const stepSchema = useMemo(
    () => ({
      title: step.title,
      fields: step.fields.map((f) => ({
        id: f.name,
        label: f.display_name,
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
      values[f.name] = f.type === "file" ? null : (f.default ?? "");
    });

    return values;
  }, [step]);

  async function handleNext(values: Record<string, any>) {
    if (!fileField) {
      setError("No file field configured for this step");
      return;
    }

    const file = values[fileField.name];

    if (!(file instanceof File)) {
      setError("Please select a file");
      return;
    }

    setError("");

    const updated = await workflowService.submitFileStep({
      caseId: state.case_id,
      fieldName: fileField.name,
      file,
    });

    onStateUpdated(updated);
  }

  async function handleSaveDraft(_values: Record<string, any>) {
    return;
  }

  return (
    <div>
      <FormRenderer
        stepSchema={stepSchema}
        defaultValues={defaultValues}
        onNext={handleNext}
        onSaveDraft={handleSaveDraft}
        isFirst={false}
        isLast={!step.next}
      />

      {error && (
        <p className="mt-3 text-sm text-red-300">{error}</p>
      )}
    </div>
  );
}