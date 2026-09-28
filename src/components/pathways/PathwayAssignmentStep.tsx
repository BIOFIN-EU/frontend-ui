"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { workflowService } from "@/services/workflow.service";
import { getLookupOptions } from "@/services/lookups.service";
import type { LookupOption } from "@/types/lookups";
import type { WorkflowField, WorkflowState, WorkflowStep } from "@/types/workflow";
import { RequirementBadge } from "@/components/FormRenderer";
import { buttonBase, buttonBaseSm, buttonGhost, buttonPrimary, buttonSecondary } from "@/lib/ui";
import type { PathwayStepMode } from "./PathwayStepScreen";

type Props = {
  state: WorkflowState;
  step: WorkflowStep;
  stepCode: string;
  mode?: PathwayStepMode;
  initialValues?: unknown;
  onStateUpdated: (state: WorkflowState) => void;
  onEditSaved?: () => void;
};

type AssignmentRow = Record<string, string>;

/**
 * The row field whose value filters this field's options, if any. Cases
 * started before the config gained `filter_by` still carry their old step
 * config, so the intermediary -> function rule is also inferred.
 */
function filterFieldOf(field: WorkflowField): string | undefined {
  if (field.filter_by) return field.filter_by;
  return field.options_source === "intermediary_function" ? "intermediary_id" : undefined;
}

function filteredKey(field: WorkflowField, parentValue: string) {
  return `${field.options_source}:${parentValue}`;
}

function rowFromCommittedItem(
  item: unknown,
  rowFields: WorkflowField[]
): AssignmentRow {
  const row: AssignmentRow = {};

  if (!item || typeof item !== "object") {
    rowFields.forEach((field) => {
      row[field.name] = "";
    });
    return row;
  }

  const record = item as Record<string, unknown>;

  rowFields.forEach((field) => {
    let raw = record[field.name];

    // Committed data serializes FK/lookup fields under the base name (e.g.
    // `intermediary`, `intermediary_function`), not the flat `*_id` name the
    // row's own field config uses - fall back to that before giving up.
    if (raw === undefined && field.name.endsWith("_id")) {
      raw = record[field.name.slice(0, -"_id".length)];
    }

    if (raw != null && typeof raw !== "object") {
      row[field.name] = String(raw);
      return;
    }

    if (raw && typeof raw === "object") {
      const nested = raw as Record<string, unknown>;
      row[field.name] = String(nested.id ?? "");
      return;
    }

    row[field.name] = "";
  });

  return row;
}

// The exact draft shape ({ assignments: [...] }, matching the submit
// payload) is a judgment call pending the backend's actual draft contract.
function normalizeInitialRows(
  initialValues: unknown,
  rowFields: WorkflowField[]
): AssignmentRow[] | null {
  if (!initialValues || !rowFields.length) return null;

  if (
    typeof initialValues === "object" &&
    !Array.isArray(initialValues) &&
    Array.isArray((initialValues as Record<string, unknown>).assignments)
  ) {
    const raw = (initialValues as Record<string, unknown>)
      .assignments as unknown[];

    return raw.map((item) => {
      const row: AssignmentRow = {};
      const record =
        item && typeof item === "object" ? (item as Record<string, unknown>) : {};

      rowFields.forEach((field) => {
        const value = record[field.name];
        row[field.name] = value != null ? String(value) : "";
      });

      return row;
    });
  }

  if (Array.isArray(initialValues)) {
    return initialValues.map((item) => rowFromCommittedItem(item, rowFields));
  }

  return null;
}

export function PathwayAssignmentStep({
  state,
  step,
  stepCode,
  mode = "submit",
  initialValues = null,
  onStateUpdated,
  onEditSaved,
}: Props) {
  const assignmentField = useMemo(() => {
    return step.fields.find((field) => field.type === "assignment_table");
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
  // Options of dependent fields, keyed by filteredKey(field, parent value).
  const [filteredOptions, setFilteredOptions] = useState<
    Record<string, LookupOption[]>
  >({});
  const pendingFilteredKeys = useRef(new Set<string>());
  const [rows, setRows] = useState<AssignmentRow[]>(() => {
    const normalized = normalizeInitialRows(initialValues, rowFields);
    return normalized && normalized.length > 0 ? normalized : [emptyRow];
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadLookups() {
      const selectFields = rowFields.filter(
        (field) => field.type === "select" && field.options_source
      );

      const results = await Promise.all(
        selectFields.map(async (field) => {
          const options = await getLookupOptions(field.options_source!);
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

  // Load each dependent field's options for the parent values in use.
  useEffect(() => {
    const needed: { key: string; field: WorkflowField; filterBy: string; parentValue: string }[] = [];

    for (const row of rows) {
      for (const field of rowFields) {
        const filterBy = filterFieldOf(field);
        const parentValue = filterBy ? row[filterBy] : "";
        if (!filterBy || !parentValue || !field.options_source) continue;

        const key = filteredKey(field, parentValue);
        if (key in filteredOptions || pendingFilteredKeys.current.has(key)) continue;

        pendingFilteredKeys.current.add(key);
        needed.push({ key, field, filterBy, parentValue });
      }
    }

    for (const { key, field, filterBy, parentValue } of needed) {
      getLookupOptions(field.options_source!, { [filterBy]: parentValue })
        .then((options) => {
          setFilteredOptions((current) => ({ ...current, [key]: options }));
        })
        .finally(() => {
          pendingFilteredKeys.current.delete(key);
        });
    }
  }, [rows, rowFields, filteredOptions]);

  const isLast = !step.next;

  function updateRow(index: number, fieldName: string, value: string) {
    setRows((current) =>
      current.map((row, i) => {
        if (i !== index) return row;

        const next = { ...row, [fieldName]: value };

        // Changing a parent (e.g. the intermediary) clears a dependent value
        // (its function) unless the new parent is known to offer it too.
        for (const field of rowFields) {
          if (filterFieldOf(field) !== fieldName || !next[field.name]) continue;

          const options = value ? filteredOptions[filteredKey(field, value)] : undefined;
          if (!options?.some((option) => option.value === next[field.name])) {
            next[field.name] = "";
          }
        }

        return next;
      })
    );
  }

  /**
   * Options, placeholder and disabled state for a select in a given row. A
   * dependent field lists only its parent's options, plus the row's current
   * value when that is no longer offered (an older assignment), so it stays
   * visible instead of silently blanking.
   */
  function selectState(field: WorkflowField, row: AssignmentRow) {
    const filterBy = filterFieldOf(field);
    const allOptions = lookupOptions[field.name] ?? [];

    if (!filterBy) {
      return { options: allOptions, placeholder: `Select ${field.display_name}`, disabled: false };
    }

    const parentField = rowFields.find((candidate) => candidate.name === filterBy);
    const parentLabel = (parentField?.display_name ?? filterBy).toLowerCase();
    const parentValue = row[filterBy];

    if (!parentValue) {
      return { options: [], placeholder: `Select ${parentLabel} first`, disabled: true };
    }

    const options = filteredOptions[filteredKey(field, parentValue)];
    if (options === undefined) {
      return { options: [], placeholder: "Loading…", disabled: true };
    }

    const current = row[field.name];
    const withCurrent =
      current && !options.some((option) => option.value === current)
        ? [
            ...options,
            {
              value: current,
              label: `${allOptions.find((option) => option.value === current)?.label ?? current} (no longer provided)`,
            },
          ]
        : options;

    if (withCurrent.length === 0) {
      return {
        options: [],
        placeholder: `No ${field.display_name.toLowerCase()}s registered for this ${parentLabel}`,
        disabled: true,
      };
    }

    return { options: withCurrent, placeholder: `Select ${field.display_name}`, disabled: false };
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

      if (mode === "edit") {
        await workflowService.editStep(state.case_id, stepCode, { assignments });
        onEditSaved?.();
        return;
      }

      const updated = await workflowService.submitJsonStep(state.case_id, {
        assignments,
      });

      onStateUpdated(updated);
    } catch (err: any) {
      setFieldErrors(err.fieldErrors || {});
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveDraft() {
    try {
      await workflowService.saveDraft(state.case_id, stepCode, {
        assignments: rows,
      });
      setDraftMessage("Draft saved");
      setTimeout(() => setDraftMessage(""), 2000);
    } catch (err) {
      console.error("save draft failed", err);
    }
  }

  if (!assignmentField || !rowFields.length) {
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
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label className="block text-sm font-medium text-white/80">
                    {field.display_name}
                  </label>
                  <RequirementBadge required={!!field.required} />
                </div>

                {field.type === "select" ? (() => {
                  const { options, placeholder, disabled } = selectState(field, row);
                  return (
                    <select
                      value={row[field.name] ?? ""}
                      onChange={(e) =>
                        updateRow(index, field.name, e.target.value)
                      }
                      disabled={disabled}
                      className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-400 disabled:cursor-not-allowed disabled:text-white/45"
                    >
                      <option value="">{placeholder}</option>
                      {options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  );
                })() : (
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
                className={`disabled:cursor-not-allowed disabled:opacity-40 ${buttonBaseSm} ${buttonGhost}`}
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
          className={`${buttonBase} ${buttonSecondary}`}
        >
          Add another assignment
        </button>

        <div className="flex items-center gap-3">
          {draftMessage && (
            <span className="text-xs font-medium text-emerald-300">
              {draftMessage}
            </span>
          )}

          <button
            type="button"
            onClick={handleSaveDraft}
            className={`${buttonBase} ${buttonGhost}`}
          >
            Save draft
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`disabled:cursor-not-allowed disabled:opacity-60 ${buttonBase} ${buttonPrimary}`}
          >
            {isSubmitting
              ? "Submitting..."
              : mode === "edit"
                ? "Save changes"
                : isLast
                  ? "Finish"
                  : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}