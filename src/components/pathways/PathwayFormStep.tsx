"use client";

import { useEffect, useMemo, useState } from "react";
import { workflowService } from "@/services/workflow.service";
import { getLookupOptions, type LookupOption } from "@/services/lookups.service";
import type { WorkflowState, WorkflowStep } from "@/types/case-dashboard";
import { FormRenderer } from "@/components/FormRenderer";
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

// Committed data serializes FK/lookup fields as a nested object for display
// (e.g. `financing_type: {id, code, name}`, mirroring how `country` nests on
// the location step) rather than the flat `financing_type_id` the step's own
// field config expects for prefilling a select input. Fall back to the
// nested shape's `.id` for any `*_id` field before giving up.
function initialValueFor(initialValues: unknown, name: string): unknown {
  if (
    !initialValues ||
    typeof initialValues !== "object" ||
    Array.isArray(initialValues)
  ) {
    return undefined;
  }

  const values = initialValues as Record<string, unknown>;
  const flat = values[name];
  if (flat !== undefined) return flat;

  if (name.endsWith("_id")) {
    const nested = values[name.slice(0, -"_id".length)];
    if (nested && typeof nested === "object" && "id" in nested) {
      return (nested as { id: unknown }).id;
    }
  }

  return undefined;
}

export function PathwayFormStep({
  state,
  step,
  stepCode,
  mode = "submit",
  initialValues = null,
  onStateUpdated,
  onEditSaved,
  onBack,
  isFirstStep = true,
}: Props) {
  const [lookupOptions, setLookupOptions] = useState<Record<string, LookupOption[]>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [draftMessage, setDraftMessage] = useState("");

  useEffect(() => {
    const selectFields = step.fields.filter(
      (f) => f.type === "select" && f.options_source
    );

    if (selectFields.length === 0) {
      setLookupOptions({});
      return;
    }

    let cancelled = false;

    async function loadLookups() {
      const results = await Promise.all(
        selectFields.map(async (f) => {
          try {
            const options = await getLookupOptions(f.options_source!);
            return [f.name, options] as const;
          } catch {
            return [f.name, []] as const;
          }
        })
      );

      if (!cancelled) {
        setLookupOptions(Object.fromEntries(results));
      }
    }

    loadLookups();

    return () => {
      cancelled = true;
    };
  }, [step]);

  const stepSchema = useMemo(
    () => ({
      step: 0,
      title: step.title,
      fields: step.fields.map((f) => ({
        id: f.name,
        label: f.display_name,
        type: f.type as any,
        content: f.content,
        required: !!f.required,
        options:
          f.type === "select" && f.options_source
            ? (lookupOptions[f.name] ?? [])
            : (Array.isArray(f.options) ? f.options : []),
      })),
    }),
    [step, lookupOptions]
  );

  const defaultValues = useMemo(() => {
    const values: Record<string, any> = {};

    step.fields.forEach((f) => {
      const prefilled = initialValueFor(initialValues, f.name);
      values[f.name] = prefilled !== undefined ? prefilled : (f.default ?? "");
    });

    return values;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  async function handleNext(values: Record<string, any>) {
    setFieldErrors({});

    try {
      const payload = { ...values };

      step.fields.forEach((f) => {
        const value = payload[f.name];

        if (value === "" || value == null) {
          payload[f.name] = null;
          return;
        }

        if (f.type === "number") {
          payload[f.name] = Number(value);
          return;
        }

        if (f.type === "select" && f.name.endsWith("_id")) {
          payload[f.name] = Number(value);
          return;
        }
      });

      if (mode === "edit") {
        await workflowService.editStep(state.case_id, stepCode, payload);
        onEditSaved?.();
        return;
      }

      const updated = await workflowService.submitJsonStep(state.case_id, payload);
      onStateUpdated(updated);
    } catch (err: any) {
      setFieldErrors(err.fieldErrors || {});
    }
  }

  async function handleSaveDraft(
    values: Record<string, any>,
    opts?: { silent?: boolean }
  ) {
    try {
      await workflowService.saveDraft(state.case_id, stepCode, values);
      if (!opts?.silent) {
        setDraftMessage("Draft saved");
        setTimeout(() => setDraftMessage(""), 2000);
      }
    } catch (err) {
      console.error("save draft failed", err);
    }
  }

  return (
    <div>
      <FormRenderer
        stepSchema={stepSchema}
        defaultValues={defaultValues}
        onNext={handleNext}
        onSaveDraft={handleSaveDraft}
        onPrev={onBack}
        isFirst={isFirstStep}
        isLast={!step.next}
        fieldErrors={fieldErrors}
        submitLabel={mode === "edit" ? "Save changes" : undefined}
      />

      {draftMessage && (
        <p className="mt-2 text-xs font-medium text-emerald-300">{draftMessage}</p>
      )}
    </div>
  );
}
