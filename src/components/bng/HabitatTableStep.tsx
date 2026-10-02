"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { workflowService } from "@/services/workflow.service";
import { bngService } from "@/services/bng.service";
import { useBngLabels, useBngReferenceData } from "@/queries/bng";
import type { WorkflowState, WorkflowStep } from "@/types/workflow";
import {
  BNG_CATEGORIES,
  type BngCategory,
  type BngMetricSummary,
} from "@/types/bng";
import { FieldHelp } from "@/components/ui/FieldHelp";
import { BngMetricPanel } from "./BngMetricPanel";
import { buttonClass } from "@/components/ui/Button";
import { fieldClass } from "@/components/ui/Field";
import type { PathwayStepMode } from "@/components/pathways/PathwayStepScreen";
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

type ParcelRow = {
  key: string;
  category: BngCategory;
  habitat_type_id: string;
  size: string;
  condition_id: string;
  strategic_significance_id: string;
  parcel_name: string;
};

let rowCounter = 0;

function emptyRow(category: BngCategory = "area"): ParcelRow {
  rowCounter += 1;
  return {
    key: `parcel-${rowCounter}`,
    category,
    habitat_type_id: "",
    size: "",
    condition_id: "",
    strategic_significance_id: "",
    parcel_name: "",
  };
}

/** Committed parcels (a list) or a saved draft ({ parcels }) -> editable rows. */
function rowsFromInitial(initial: unknown): ParcelRow[] {
  const list = Array.isArray(initial)
    ? initial
    : initial && typeof initial === "object" && Array.isArray((initial as { parcels?: unknown }).parcels)
      ? (initial as { parcels: unknown[] }).parcels
      : [];

  return list
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => {
      const category = BNG_CATEGORIES.includes(item.category as BngCategory)
        ? (item.category as BngCategory)
        : "area";
      return {
        ...emptyRow(category),
        habitat_type_id: String(item.habitat_type_id ?? ""),
        size: item.size != null ? String(item.size) : "",
        condition_id: String(item.condition_id ?? ""),
        strategic_significance_id: String(item.strategic_significance_id ?? ""),
        parcel_name: typeof item.parcel_name === "string" ? item.parcel_name : "",
      };
    });
}

function isComplete(row: ParcelRow) {
  return Boolean(
    row.habitat_type_id && row.condition_id && row.strategic_significance_id && Number(row.size) > 0
  );
}

function toPayload(row: ParcelRow) {
  return {
    parcel_name: row.parcel_name.trim() || null,
    habitat_type_id: Number(row.habitat_type_id),
    condition_id: Number(row.condition_id),
    strategic_significance_id: Number(row.strategic_significance_id),
    size: Number(row.size),
  };
}

const selectClass = fieldClass();

export function HabitatTableStep({
  state,
  step,
  stepCode,
  mode = "submit",
  initialValues,
  onStateUpdated,
  onEditSaved,
}: Props) {
  const tableField = step.fields.find((field) => field.type === "habitat_table");
  const phase = tableField?.phase ?? "baseline";

  const reference = useBngReferenceData().data ?? null;
  const labels = useBngLabels();
  const [rows, setRows] = useState<ParcelRow[]>(() => {
    const initial = rowsFromInitial(initialValues);
    return initial.length > 0 ? initial : [emptyRow()];
  });
  const [summary, setSummary] = useState<BngMetricSummary | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");
  const previewRun = useRef(0);

  const completeRows = useMemo(() => rows.filter(isComplete), [rows]);

  // Live metric: recalculated shortly after the rows stop changing.
  useEffect(() => {
    const run = ++previewRun.current;
    setPreviewing(true);
    const timer = setTimeout(() => {
      bngService
        .previewMetric(state.case_id, phase, completeRows.map(toPayload))
        .then((result) => {
          if (run === previewRun.current) setSummary(result);
        })
        .catch(() => undefined)
        .finally(() => {
          if (run === previewRun.current) setPreviewing(false);
        });
    }, 400);
    return () => clearTimeout(timer);
  }, [completeRows, phase, state.case_id]);

  const isLast = !step.next;

  function updateRow(key: string, patch: Partial<ParcelRow>) {
    setRows((current) =>
      current.map((row) => {
        if (row.key !== key) return row;
        const next = { ...row, ...patch };
        // A habitat only fits one category: changing category clears it.
        if (patch.category && patch.category !== row.category) next.habitat_type_id = "";
        return next;
      })
    );
  }

  function removeRow(key: string) {
    setRows((current) => (current.length === 1 ? current : current.filter((row) => row.key !== key)));
  }

  async function handleSubmit() {
    setError("");

    if (completeRows.length === 0) {
      setError("Add at least one habitat parcel with a habitat, size, condition and strategic significance.");
      return;
    }
    if (completeRows.length !== rows.length) {
      setError("Complete or remove the unfinished rows.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { parcels: completeRows.map(toPayload) };

      if (mode === "edit") {
        await workflowService.editStep(state.case_id, stepCode, payload);
        onEditSaved?.();
        return;
      }

      onStateUpdated(await workflowService.submitJsonStep(state.case_id, payload));
    } catch (err: any) {
      setError(err?.fieldErrors?.parcels || err?.message || "Could not save the habitats.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveDraft() {
    try {
      await workflowService.saveDraft(state.case_id, stepCode, {
        parcels: rows.map(({ key, ...row }) => row),
      });
      setDraftMessage("Draft saved");
      setTimeout(() => setDraftMessage(""), 2000);
    } catch (err) {
      console.error("save draft failed", err);
    }
  }

  const habitatsFor = (category: BngCategory) =>
    (reference?.habitat_types ?? []).filter((habitat) => habitat.category === category);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-fg/10 bg-fg/[0.03] p-6">
        <div className="mb-5 flex items-start gap-1.5">
          <p className="text-sm text-fg/60">
            {phase === "baseline"
              ? "Record the habitats on the site before any works, one row per habitat parcel."
              : "Record the habitats the site will have after the works, one row per habitat parcel."}
          </p>
          {tableField && <FieldHelp text={tableField.help_text} label={tableField.display_name} />}
        </div>

        {error && (
          <Alert tone="danger" className="mb-4">
            {error}
          </Alert>
        )}

        <div className="space-y-3">
          {rows.map((row, index) => {
            const habitats = habitatsFor(row.category);
            const selectedHabitat = habitats.find((habitat) => String(habitat.id) === row.habitat_type_id);

            return (
              <div key={row.key} className="rounded-xl surface-card p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-eyebrow tracking-wider">
                    Parcel {index + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeRow(row.key)}
                    disabled={rows.length === 1}
                    className="text-xs font-semibold text-fg/60 hover:text-fg disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <label className="space-y-1">
                    <span className="block text-label">Type</span>
                    <select
                      value={row.category}
                      onChange={(e) => updateRow(row.key, { category: e.target.value as BngCategory })}
                      className={selectClass}
                    >
                      {BNG_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {labels.category(category)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1 xl:col-span-2">
                    <span className="block text-label">Habitat</span>
                    <select
                      value={row.habitat_type_id}
                      onChange={(e) => updateRow(row.key, { habitat_type_id: e.target.value })}
                      className={selectClass}
                    >
                      <option value="">{reference ? "Select habitat" : "Loading…"}</option>
                      {habitats.map((habitat) => (
                        <option key={habitat.id} value={habitat.id}>
                          {habitat.name}
                        </option>
                      ))}
                    </select>
                    {selectedHabitat && (
                      <span className="block text-xs text-fg/50">
                        Distinctiveness: {selectedHabitat.distinctiveness.replace("_", " ")}
                        {selectedHabitat.description ? ` · ${selectedHabitat.description}` : ""}
                      </span>
                    )}
                  </label>

                  <label className="space-y-1">
                    <span className="block text-label">
                      Size ({labels.sizeUnit(row.category)})
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={row.size}
                      onChange={(e) => updateRow(row.key, { size: e.target.value })}
                      onWheel={(e) => e.currentTarget.blur()}
                      className={selectClass}
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="block text-label">Condition</span>
                    <select
                      value={row.condition_id}
                      onChange={(e) => updateRow(row.key, { condition_id: e.target.value })}
                      className={selectClass}
                    >
                      <option value="">Select condition</option>
                      {(reference?.conditions ?? []).map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1">
                    <span className="block text-label">Strategic significance</span>
                    <select
                      value={row.strategic_significance_id}
                      onChange={(e) => updateRow(row.key, { strategic_significance_id: e.target.value })}
                      className={selectClass}
                    >
                      <option value="">Select significance</option>
                      {(reference?.strategic_significance ?? []).map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1 md:col-span-2 xl:col-span-3">
                    <span className="block text-label">Parcel name (optional)</span>
                    <input
                      value={row.parcel_name}
                      onChange={(e) => updateRow(row.key, { parcel_name: e.target.value })}
                      placeholder="e.g. North meadow"
                      className={selectClass}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={() => setRows((current) => [...current, emptyRow()])} className={buttonClass("secondary")}>
            Add parcel
          </button>

          <div className="flex items-center gap-3">
            {draftMessage && <span className="text-xs font-medium text-accent-300">{draftMessage}</span>}
            <button type="button" onClick={handleSaveDraft} className={buttonClass("ghost")}>
              Save draft
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`disabled:cursor-not-allowed disabled:opacity-60 ${buttonClass("primary")}`}
            >
              {isSubmitting ? "Submitting..." : mode === "edit" ? "Save changes" : isLast ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>

      <BngMetricPanel
        summary={summary}
        loading={previewing}
        title={phase === "baseline" ? "Metric preview (baseline)" : "Metric preview (after works)"}
        scope="workflow"
      />
    </div>
  );
}
