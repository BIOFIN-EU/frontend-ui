"use client";

import { useEffect, useMemo, useState } from "react";
import { workflowService } from "@/services/workflow.service";
import { getLookupOptions, type LookupOption } from "@/services/lookups.service";
import type { WorkflowState } from "@/types/case-dashboard";

type Props = {
  state: WorkflowState;
  onStateUpdated: (state: WorkflowState) => void;
};

type AssignmentRow = Record<string, string>;

export function PathwayAssignmentStep({ state, onStateUpdated }: Props) {
  const step = state.step;

  const assignmentField = useMemo(() => {
    return step?.fields.find((field) => field.type === "assignment_table");
  }, [step]);

  const rowFields = useMemo(() => {
    return assignmentField?.row_fields ?? [];
  }, [assignmentField]);

  const emptyRow = useMemo(() => {
    return rowFields.reduce<AssignmentRow>((row, field) => {
      row[field.name] = "";
      return row;
    }, {});
  }, [rowFields]);

  const [lookupOptions, setLookupOptions] = useState<
    Record<string, LookupOption[]>
  >({});
  const [rows, setRows] = useState<AssignmentRow[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!rowFields.length) return;

    setRows([emptyRow]);
  }, [rowFields, emptyRow]);

  useEffect(() => {
    let cancelled = false;

    async function loadLookups() {
      const selectFields = rowFields.filter(
        (field) => field.type === "select" && field.options_source
      );

      const results = await Promise.all(
        selectFields.map(async (field) => {
          const options = await getLookupOptions(field.options_source);
          return [field.name, options] as const;
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
  }, [rowFields]);

  const isLast = !step?.next;

  function updateRow(index: number, fieldName: string, value: string) {
    setRows((current) =>
      current.map((row, i) =>
        i === index ? { ...row, [fieldName]: value } : row
      )
    );
  }

  function addRow() {
    setRows((current) => [...current, { ...emptyRow }]);
  }

  function removeRow(index: number) {
    setRows((current) =>
      current.length === 1 ? current : current.filter((_, i) => i !== index)
    );
  }

  async function handleSubmit() {
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const validRows = rows.filter((row) =>
        rowFields.every((field) => {
          if (!field.required) return true;
          return row[field.name] !== undefined && row[field.name] !== "";
        })
      );

      if (validRows.length === 0) {
        setFieldErrors({
          assignments: "Please add at least one assignment.",
        });
        return;
      }

      const assignments = validRows.map((row) => {
        return rowFields.reduce<Record<string, number | string>>((item, field) => {
          const value = row[field.name];

          item[field.name] =
            field.type === "select" || field.type === "number"
              ? Number(value)
              : value;

          return item;
        }, {});
      });

      const updated = await workflowService.submitJsonStep(state.case_id, {
        assignments,
      });

      onStateUpdated(updated.state ?? updated);
    } catch (err: any) {
      setFieldErrors(err.fieldErrors || {});
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!step || !assignmentField || !rowFields.length) {
    return <p className="text-sm text-white/70">No assignment step available.</p>;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="mb-6">
        <p className="mt-2 text-sm text-white/60">
          Create one or more assignments and define the role for each.
        </p>
      </div>

      {fieldErrors.assignments && (
        <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {fieldErrors.assignments}
        </div>
      )}

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-4 md:grid-cols-[1fr_1fr_auto]"
          >
            {rowFields.map((field) => (
              <div key={field.name}>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  {field.display_name}
                </label>

                {field.type === "select" ? (
                  <select
                    value={row[field.name] ?? ""}
                    onChange={(e) =>
                      updateRow(index, field.name, e.target.value)
                    }
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-400"
                  >
                    <option value="">Select {field.display_name}</option>
                    {(lookupOptions[field.name] ?? []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={row[field.name] ?? ""}
                    onChange={(e) =>
                      updateRow(index, field.name, e.target.value)
                    }
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-400"
                  />
                )}
              </div>
            ))}

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => removeRow(index)}
                disabled={rows.length === 1}
                className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={addRow}
          className="rounded-xl border border-emerald-400/30 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/10"
        >
          Add another assignment
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="rounded-xl bg-emerald-400 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Submitting..." : isLast ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}