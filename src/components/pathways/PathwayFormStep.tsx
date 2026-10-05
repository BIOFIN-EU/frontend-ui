"use client";

import { useCallback, useMemo, useState } from "react";
import { workflowService } from "@/services/workflow.service";
import { useLookupOptions, type LookupRequest } from "@/queries/lookups";
import type { LookupOption } from "@/types/lookups";
import type { FieldOption } from "@/types/forms";
import type { WorkflowState, WorkflowStep } from "@/types/workflow";
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

function toFieldOptions(options: LookupOption[]): FieldOption[] {
  return options.map((o) => ({
    label: o.label,
    value: o.value,
    description: o.description,
    groupLabel: o.group_label,
  }));
}

// Lookup id of a dependent field's unfiltered list (to name a saved value
// that no longer fits).
const allOptionsId = (name: string) => `${name}::all`;

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [draftMessage, setDraftMessage] = useState("");

  const defaultValues = useMemo(() => {
    const values: Record<string, any> = {};

    step.fields.forEach((f) => {
      const prefilled = initialValueFor(initialValues, f.name);
      values[f.name] = prefilled !== undefined ? prefilled : (f.default ?? "");
    });

    return values;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Values of the fields other fields' options depend on (filter_by), as
  // the form reports them.
  const parentFields = useMemo(
    () => [...new Set(step.fields.flatMap((f) => (f.filter_by ? [f.filter_by] : [])))],
    [step]
  );
  const pickParents = useCallback(
    (values: Record<string, any>) =>
      Object.fromEntries(parentFields.map((name) => [name, String(values[name] ?? "")])),
    [parentFields]
  );
  const [parentValues, setParentValues] = useState<Record<string, string>>(() => pickParents(defaultValues));
  const handleValuesChange = useCallback(
    (values: Record<string, any>) => {
      const next = pickParents(values);
      setParentValues((prev) => (parentFields.every((name) => prev[name] === next[name]) ? prev : next));
    },
    [parentFields, pickParents]
  );

  const lookupRequests = useMemo(() => {
    const requests: LookupRequest[] = [];
    step.fields.forEach((f) => {
      if (f.type !== "select" || !f.options_source) return;
      if (!f.filter_by) {
        requests.push({ id: f.name, source: f.options_source });
        return;
      }
      const parent = parentValues[f.filter_by];
      if (parent) {
        requests.push({ id: f.name, source: f.options_source, filters: { [f.filter_by]: parent } });
      }
      requests.push({ id: allOptionsId(f.name), source: f.options_source });
    });
    return requests;
  }, [step, parentValues]);
  const lookupOptions = useLookupOptions(lookupRequests);

  const stepSchema = useMemo(
    () => ({
      step: 0,
      title: step.title,
      fields: step.fields.map((f) => {
        const field = {
          id: f.name,
          label: f.display_name,
          help: f.help_text,
          describeOptions: f.describe_options,
          type: f.type as any,
          content: f.content,
          required: !!f.required,
          options:
            f.type === "select" && f.options_source
              ? toFieldOptions(lookupOptions[f.name] ?? [])
              : (Array.isArray(f.options) ? f.options : []),
          optionsLoading: !!f.options_source && lookupOptions[f.name] === undefined,
        };
        if (!f.filter_by || !f.options_source) return field;

        // Only what fits the field above; nothing until it is chosen.
        const parent = parentValues[f.filter_by];
        const parentLabel = step.fields.find((p) => p.name === f.filter_by)?.display_name ?? "the field above";
        return {
          ...field,
          filterBy: f.filter_by,
          optionsFor: parent,
          optionsLoading: !!parent && lookupOptions[f.name] === undefined,
          disabled: !parent,
          placeholder: parent ? undefined : `Select ${parentLabel} first`,
          allOptions: toFieldOptions(lookupOptions[allOptionsId(f.name)] ?? []),
        };
      }),
    }),
    [step, lookupOptions, parentValues]
  );

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
        onValuesChange={handleValuesChange}
        onPrev={onBack}
        isFirst={isFirstStep}
        isLast={!step.next}
        fieldErrors={fieldErrors}
        submitLabel={mode === "edit" ? "Save changes" : undefined}
      />

      {draftMessage && (
        <p className="mt-2 text-xs font-medium text-accent-300">{draftMessage}</p>
      )}
    </div>
  );
}
