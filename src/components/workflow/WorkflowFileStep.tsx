"use client";

import { useMemo, useState } from "react";
import { workflowService } from "@/services/workflow.service";
import type { WorkflowState } from "@/types/workflow";
import { FormRenderer } from "@/components/FormRenderer";

type Props = {
  state: WorkflowState;
  onStateUpdated: (state: WorkflowState) => void;
};

export function WorkflowFileStep({ state, onStateUpdated }: Props) {
  const step = state.step!;
  const fileField = step.fields.find((f) => f.type === "file");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const initialValues = useMemo(() => {
    const v: Record<string, unknown> = {};
    step.fields.forEach((f) => {
      v[f.name] = f.type === "file" ? null : f.default ?? "";
    });
    return v;
  }, [step.fields]);

  async function handleSubmit(values: Record<string, unknown>) {
    if (!fileField) return;

    const file = values[fileField.name];

    if (!(file instanceof File)) {
      setError("Please select a file");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const updated = await workflowService.submitFileStep({
        caseId: state.case_id,
        fieldName: fileField.name,
        file,
      });

      onStateUpdated(updated);
    } catch (err) {
      setError(workflowService.extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <FormRenderer
        fields={step.fields}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel={submitting ? "Uploading..." : "Continue"}
      />

      {error && (
        <p className="mt-3 text-sm text-red-300">{error}</p>
      )}
    </div>
  );
}