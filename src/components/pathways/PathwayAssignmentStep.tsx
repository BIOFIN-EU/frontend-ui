"use client";

import { useMemo, useState } from "react";
import { workflowService } from "@/services/workflow.service";
import { useQueryClient } from "@tanstack/react-query";
import { lookupKeys, useLookupOptions, type LookupRequest } from "@/queries/lookups";
import type { LookupOption } from "@/types/lookups";
import type { WorkflowField, WorkflowState, WorkflowStep } from "@/types/workflow";
import { RequirementBadge } from "@/components/FormRenderer";
import { FieldHelp } from "@/components/ui/FieldHelp";
import { buttonClass } from "@/components/ui/Button";
import { fieldClass } from "@/components/ui/Field";
import type { PathwayStepMode } from "./PathwayStepScreen";
import { Alert } from "@/components/ui/Alert";

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

  const [rows, setRows] = useState<AssignmentRow[]>(() => {
    const normalized = normalizeInitialRows(initialValues, rowFields);
    return normalized && normalized.length > 0 ? normalized : [emptyRow];
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");

  const queryClient = useQueryClient();

  // Every select's full option list (also used to label a value that is no
  // longer offered).
  const lookupRequests = useMemo(
    () =>
      rowFields
        .filter((field) => field.type === "select" && field.options_source)
        .map((field) => ({ id: field.name, source: field.options_source! })),
    [rowFields]
  );
  const lookupOptions = useLookupOptions(lookupRequests);

  // Options of dependent fields for the parent values in use, keyed by
  // filteredKey(field, parent value).
  const filteredRequests = useMemo(() => {
    const byId = new Map<string, LookupRequest>();
    for (const row of rows) {
      for (const field of rowFields) {
        const filterBy = filterFieldOf(field);
        const parentValue = filterBy ? row[filterBy] : "";
        if (!filterBy || !parentValue || !field.options_source) continue;

        const id = filteredKey(field, parentValue);
        byId.set(id, { id, source: field.options_source, filters: { [filterBy]: parentValue } });
      }
    }
    return [...byId.values()];
  }, [rows, rowFields]);
  const filteredOptions = useLookupOptions(filteredRequests);

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

          // Options already loaded for the new parent, if any.
          const options = value
            ? queryClient.getQueryData<LookupOption[]>(
                lookupKeys.options(field.options_source!, { [fieldName]: value })
              )
            : undefined;
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
    return <p className="text-sm text-fg/70">No assignment step available.</p>;
  }

  return (
    <div className="rounded-2xl border border-fg/10 bg-fg/[0.03] p-4 sm:p-6">
      <div className="mb-6 flex items-start gap-1.5">
        <p className="mt-2 text-sm text-fg/60">
          Create one or more assignments and define the role for each.
        </p>
        {assignmentField && (
          <span className="mt-2">
            <FieldHelp text={assignmentField.help_text} label={assignmentField.display_name} />
          </span>
        )}
      </div>

      {fieldErrors.assignments && (
        <Alert tone="danger" className="mb-4">
          {fieldErrors.assignments}
        </Alert>
      )}

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-xl surface-card p-4 md:grid-cols-[1fr_1fr_auto]"
          >
            {rowFields.map((field) => (
              <div key={field.name}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5">
                    <label className="block text-sm font-medium text-fg/80">
                      {field.display_name}
                    </label>
                    <FieldHelp text={field.help_text} label={field.display_name} />
                  </span>
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
                      className={`${fieldClass()} disabled:cursor-not-allowed disabled:text-fg/45`}
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
                    className={fieldClass()}
                  />
                )}
              </div>
            ))}

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => removeRow(index)}
                disabled={rows.length === 1}
                className={`disabled:cursor-not-allowed disabled:opacity-40 ${buttonClass("ghost", "sm")}`}
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
          className={buttonClass("secondary")}
        >
          Add another assignment
        </button>

        <div className="flex items-center gap-3">
          {draftMessage && (
            <span className="text-xs font-medium text-accent-300">
              {draftMessage}
            </span>
          )}

          <button
            type="button"
            onClick={handleSaveDraft}
            className={buttonClass("ghost")}
          >
            Save draft
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`disabled:cursor-not-allowed disabled:opacity-60 ${buttonClass("primary")}`}
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