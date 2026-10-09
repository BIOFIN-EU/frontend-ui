"use client";

import { useMemo, useState } from "react";
import { workflowService } from "@/services/workflow.service";
import type { WorkflowState, WorkflowStep } from "@/types/workflow";
import { FormRenderer } from "@/components/FormRenderer";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { ApiError } from "@/lib/api";
import { UPLOAD_ACCEPT, UPLOAD_HINT, uploadProblem } from "@/lib/documents";
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

  // A state from an older API response may come without documents.
  const matchingDoc = fileField
    ? (state.documents ?? []).find(
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
        help: f.help_text,
        type: f.type as any,
        required: !!f.required,
        options: Array.isArray(f.options) ? f.options : [],
        ...(f.type === "file" ? { accept: UPLOAD_ACCEPT, hint: UPLOAD_HINT } : {}),
      })),
    }),
    [step]
  );

  const defaultValues = useMemo(() => {
    const values: Record<string, any> = {};

    step.fields.forEach((f) => {
      values[f.name] = f.type === "file" ? null : (f.default ?? "");
    });
    // Replacing a file starts from the notes saved with it.
    if (matchingDoc?.notes && "document_notes" in values) {
      values.document_notes = matchingDoc.notes;
    }

    return values;
  }, [step, matchingDoc]);

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

    const problem = uploadProblem(file);
    if (problem) {
      setError(problem);
      return;
    }

    setError("");

    try {
      const updated = await workflowService.submitFileStep({
        caseId: state.case_id,
        fieldName: fileField.name,
        file,
        notes:
          typeof values.document_notes === "string" ? values.document_notes : undefined,
      });

      onStateUpdated(updated);
    } catch (err) {
      // A refused file (wrong type, too large) comes back as a field error.
      if (err instanceof ApiError) {
        setError(err.fieldErrors[fileField.name] ?? err.message);
      } else {
        setError("The upload failed. Please try again.");
      }
    }
  }

  // File uploads can't be edited via the PATCH edit endpoint (the backend
  // rejects it for multipart steps), so a revisited file step is shown
  // read-only, reusing the same document-matching logic as the project
  // dashboard.
  if (mode === "edit") {
    return (
      <div className="rounded-2xl surface-card p-4 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-fg/40">
          Uploaded file
        </p>

        <div className="mt-3">
          {matchingDoc ? (
            <DocumentCard caseId={state.case_id} document={matchingDoc} />
          ) : (
            <p className="text-sm text-fg">
              No file has been uploaded for this step yet.
            </p>
          )}
        </div>

        <p className="mt-4 text-xs text-fg/50">
          File uploads can&apos;t be changed from here once submitted.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {matchingDoc && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg/40">
            Already uploaded
          </p>
          <DocumentCard caseId={state.case_id} document={matchingDoc} />
          <p className="mt-2 text-xs text-fg/50">
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
        <p className="mt-3 text-sm text-danger-300">{error}</p>
      )}
    </div>
  );
}
