"use client";

import { useMemo, useState } from "react";
import { workflowService } from "@/services/workflow.service";
import type { WorkflowState, WorkflowStep } from "@/types/case-dashboard";
import { FormRenderer } from "@/components/FormRenderer";
import { DocumentCard } from "@/components/documents/DocumentCard";
import type { PathwayStepMode } from "./PathwayStepScreen";

type Props = {
  state: WorkflowState;
  step: WorkflowStep;
  stepCode: string;
  mode?: PathwayStepMode;
  initialValues?: unknown;
  onStateUpdated: (state: WorkflowState) => void;
  onEditSaved?: () => void;
  onBack?: () => void;
  isFirstStep?: boolean;
};

export function PathwayFileStep({
  state,
  step,
  stepCode,
  mode = "submit",
  onStateUpdated,
  onBack,
  isFirstStep = true,
}: Props) {
  const fileField = step.fields.find((f) => f.type === "file");
  const [error, setError] = useState("");

  const matchingDoc = fileField
    ? state.documents.find(
        (doc) => doc.field_name === fileField.name && doc.step_code === stepCode
      )
    : undefined;

  const stepSchema = useMemo(
    () => ({
      step: 0,
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

  // File uploads can't be edited via the PATCH edit endpoint (the backend
  // rejects it for multipart steps), so a revisited file step is shown
  // read-only, reusing the same document-matching logic as the project
  // dashboard.
  if (mode === "edit") {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
          Uploaded file
        </p>

        <div className="mt-3">
          {matchingDoc ? (
            <DocumentCard caseId={state.case_id} document={matchingDoc} />
          ) : (
            <p className="text-sm text-white">
              No file has been uploaded for this step yet.
            </p>
          )}
        </div>

        <p className="mt-4 text-xs text-white/50">
          File uploads can&apos;t be changed from here once submitted.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {matchingDoc && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
            Already uploaded
          </p>
          <DocumentCard caseId={state.case_id} document={matchingDoc} />
          <p className="mt-2 text-xs text-white/50">
            Uploading a new file below will replace this one.
          </p>
        </div>
      )}

      <FormRenderer
        stepSchema={stepSchema}
        defaultValues={defaultValues}
        onNext={handleNext}
        onSaveDraft={async () => {}}
        onPrev={onBack}
        isFirst={isFirstStep}
        isLast={!step.next}
        submitLabel={matchingDoc ? "Replace file" : undefined}
      />

      {error && (
        <p className="mt-3 text-sm text-red-300">{error}</p>
      )}
    </div>
  );
}
