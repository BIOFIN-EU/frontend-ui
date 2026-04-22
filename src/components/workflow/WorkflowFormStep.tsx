"use client";

import { useEffect, useMemo, useState } from "react";
import { workflowService } from "@/services/workflow.service";
import { getLookupOptions, type LookupOption } from "@/services/lookups.service";
import type { WorkflowState } from "@/types/case-dashboard";
import { FormRenderer } from "@/components/FormRenderer";

type Props = {
  state: WorkflowState;
  onStateUpdated: (state: WorkflowState) => void;
};


export function WorkflowFormStep({ state, onStateUpdated }: Props) {
  const step = state.step;
  const [lookupOptions, setLookupOptions] = useState<Record<string, LookupOption[]>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!step) return;

    let cancelled = false;

    async function loadLookups() {
      const selectFields = step.fields.filter(
        (f) => f.type === "select" && f.options_source
      );

      if (selectFields.length === 0) {
        setLookupOptions({});
        return;
      }

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

  if (!step) {
    return <p className="text-sm text-white/70">No step available.</p>;
  }

  const stepSchema = useMemo(
    () => ({
      title: step.title,
      fields: step.fields.map((f) => ({
        id: f.name,
        label: f.display_name,
        type: f.type as any,
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
      values[f.name] = f.default ?? "";
    });

    return values;
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

    const updated = await workflowService.submitJsonStep(state.case_id, payload);
    onStateUpdated(updated.state ?? updated);
  } catch (err: any) {
    setFieldErrors(err.fieldErrors || {});
  }
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
      fieldErrors={fieldErrors}
    />
  );
}