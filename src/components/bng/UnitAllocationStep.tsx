"use client";

import { useEffect, useMemo, useState } from "react";
import { workflowService } from "@/services/workflow.service";
import { bngService } from "@/services/bng.service";
import type { WorkflowState, WorkflowStep } from "@/types/workflow";
import {
  BNG_ALLOCATION_UNIT_FIELD,
  BNG_CATEGORIES,
  BNG_CATEGORY_LABEL,
  formatUnits,
  type BngAllocation,
  type BngCategory,
  type BngHabitatBank,
  type BngMetricSummary,
} from "@/types/bng";
import { FieldHelp } from "@/components/ui/FieldHelp";
import { buttonBase, buttonBaseSm, buttonGhost, buttonPrimary, buttonSecondary } from "@/lib/ui";
import type { PathwayStepMode } from "@/components/pathways/PathwayStepScreen";

type Props = {
  state: WorkflowState;
  step: WorkflowStep;
  stepCode: string;
  mode?: PathwayStepMode;
  initialValues?: unknown;
  onStateUpdated: (state: WorkflowState) => void;
  onEditSaved?: () => void;
};

type AllocationRow = { key: string; bank_id: string } & Record<BngCategory, string>;

let rowCounter = 0;

function emptyRow(): AllocationRow {
  rowCounter += 1;
  return { key: `allocation-${rowCounter}`, bank_id: "", area: "", hedgerow: "", watercourse: "" };
}

function initialAllocations(initial: unknown): BngAllocation[] {
  if (!initial || typeof initial !== "object") return [];
  const list = (initial as { allocations?: unknown }).allocations;
  return Array.isArray(list)
    ? list.filter((item): item is BngAllocation => Boolean(item) && typeof item === "object")
    : [];
}

function rowFromAllocation(allocation: BngAllocation | Record<string, unknown>): AllocationRow {
  const record = allocation as Record<string, unknown>;
  // Committed allocations use *_units numbers; drafts store the rows as-is.
  const value = (category: BngCategory) => {
    const raw = record[BNG_ALLOCATION_UNIT_FIELD[category]] ?? record[category];
    return raw == null || Number(raw) === 0 ? "" : String(raw);
  };
  return {
    ...emptyRow(),
    bank_id: String(record.habitat_bank_case_id ?? record.bank_id ?? ""),
    area: value("area"),
    hedgerow: value("hedgerow"),
    watercourse: value("watercourse"),
  };
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400";

export function UnitAllocationStep({
  state,
  step,
  stepCode,
  mode = "submit",
  initialValues,
  onStateUpdated,
  onEditSaved,
}: Props) {
  const field = step.fields.find((candidate) => candidate.type === "bng_allocation");
  const committed = useMemo(() => initialAllocations(initialValues), [initialValues]);

  const [banks, setBanks] = useState<BngHabitatBank[] | null>(null);
  const [summary, setSummary] = useState<BngMetricSummary | null>(null);
  const [rows, setRows] = useState<AllocationRow[]>(() => {
    const initial = initialAllocations(initialValues).map(rowFromAllocation);
    return initial.length > 0 ? initial : [emptyRow()];
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");

  useEffect(() => {
    bngService.listHabitatBanks().then(setBanks).catch(() => setBanks([]));
    bngService.getCaseMetric(state.case_id).then(setSummary).catch(() => setSummary(null));
  }, [state.case_id]);

  // A bank's listed availability already excludes this development's own
  // saved allocation, so add that back when editing; banks this development
  // already uses stay selectable even when otherwise fully taken.
  const bankOptions = useMemo(() => {
    const byId = new Map<number, { id: number; name: string; max: Record<BngCategory, number> }>();
    for (const bank of banks ?? []) {
      byId.set(bank.case_id, {
        id: bank.case_id,
        name: bank.name ?? `Habitat bank #${bank.case_id}`,
        max: { ...bank.available_units },
      });
    }
    for (const allocation of committed) {
      const id = allocation.habitat_bank_case_id;
      const entry = byId.get(id) ?? {
        id,
        name: allocation.habitat_bank_name ?? `Habitat bank #${id}`,
        max: { area: 0, hedgerow: 0, watercourse: 0 },
      };
      for (const category of BNG_CATEGORIES) {
        entry.max[category] += Number(allocation[BNG_ALLOCATION_UNIT_FIELD[category]] ?? 0);
      }
      byId.set(id, entry);
    }
    return Array.from(byId.values());
  }, [banks, committed]);

  const needed = useMemo(() => {
    const result = { area: 0, hedgerow: 0, watercourse: 0 } as Record<BngCategory, number>;
    for (const entry of summary?.categories ?? []) {
      result[entry.category] = entry.onsite_shortfall_units ?? 0;
    }
    return result;
  }, [summary]);

  const allocatedTotal = useMemo(() => {
    const result = { area: 0, hedgerow: 0, watercourse: 0 } as Record<BngCategory, number>;
    for (const row of rows) {
      for (const category of BNG_CATEGORIES) result[category] += Number(row[category]) || 0;
    }
    return result;
  }, [rows]);

  const nothingNeeded = BNG_CATEGORIES.every((category) => needed[category] <= 0);
  const isLast = !step.next;

  function updateRow(key: string, patch: Partial<AllocationRow>) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  async function handleSubmit() {
    setError("");
    const filled = rows.filter((row) => row.bank_id);

    const allocations = filled.map((row) => ({
      habitat_bank_case_id: Number(row.bank_id),
      habitat_units: Number(row.area) || 0,
      hedgerow_units: Number(row.hedgerow) || 0,
      watercourse_units: Number(row.watercourse) || 0,
    }));

    if (allocations.some((a) => a.habitat_units + a.hedgerow_units + a.watercourse_units <= 0)) {
      setError("Enter some units for each habitat bank you have chosen, or remove the row.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { allocations };
      if (mode === "edit") {
        await workflowService.editStep(state.case_id, stepCode, payload);
        onEditSaved?.();
        return;
      }
      onStateUpdated(await workflowService.submitJsonStep(state.case_id, payload));
    } catch (err: any) {
      setError(err?.fieldErrors?.allocations || err?.message || "Could not save the allocation.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveDraft() {
    try {
      await workflowService.saveDraft(state.case_id, stepCode, {
        allocations: rows.map(({ key, ...row }) => row),
      });
      setDraftMessage("Draft saved");
      setTimeout(() => setDraftMessage(""), 2000);
    } catch (err) {
      console.error("save draft failed", err);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-5 flex items-start gap-1.5">
          <p className="text-sm text-white/60">
            Take units from registered habitat banks to cover the shortfall that can&apos;t be met on-site.
          </p>
          {field && <FieldHelp text={field.help_text} label={field.display_name} />}
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          {BNG_CATEGORIES.map((category) => {
            const covered = allocatedTotal[category] >= needed[category];
            return (
              <div key={category} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/45">
                  {BNG_CATEGORY_LABEL[category]}
                </p>
                <p className="mt-1 text-sm text-white">
                  Needed off-site: <span className="font-semibold tabular-nums">{formatUnits(needed[category])}</span>
                </p>
                <p className={`text-sm ${covered ? "text-emerald-200" : "text-amber-200"}`}>
                  Allocated: <span className="font-semibold tabular-nums">{formatUnits(allocatedTotal[category])}</span>
                </p>
              </div>
            );
          })}
        </div>

        {nothingNeeded && summary && (
          <p className="mb-4 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            The 10% target is met on-site, so no off-site units are needed. You can continue without allocating any.
          </p>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {banks !== null && bankOptions.length === 0 ? (
          <p className="text-sm text-white/60">
            No registered habitat banks have units available yet. A habitat bank becomes available once all of
            its steps are completed.
          </p>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => {
              const bank = bankOptions.find((option) => String(option.id) === row.bank_id);
              return (
                <div key={row.key} className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-4 md:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                  <label className="space-y-1">
                    <span className="block text-xs font-medium text-white/70">Habitat bank</span>
                    <select value={row.bank_id} onChange={(e) => updateRow(row.key, { bank_id: e.target.value })} className={inputClass}>
                      <option value="">{banks === null ? "Loading…" : "Select habitat bank"}</option>
                      {bankOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          #{option.id} {option.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  {BNG_CATEGORIES.map((category) => (
                    <label key={category} className="space-y-1">
                      <span className="block text-xs font-medium text-white/70">{BNG_CATEGORY_LABEL[category]}</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        value={row[category]}
                        onChange={(e) => updateRow(row.key, { [category]: e.target.value } as Partial<AllocationRow>)}
                        onWheel={(e) => e.currentTarget.blur()}
                        disabled={!bank}
                        className={`${inputClass} disabled:opacity-40`}
                      />
                      {bank && (
                        <span className="block text-xs text-white/50">Up to {formatUnits(bank.max[category])}</span>
                      )}
                    </label>
                  ))}

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => setRows((current) => (current.length === 1 ? [emptyRow()] : current.filter((r) => r.key !== row.key)))}
                      className={`${buttonBaseSm} ${buttonGhost}`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={() => setRows((current) => [...current, emptyRow()])} className={`${buttonBase} ${buttonSecondary}`}>
            Add habitat bank
          </button>

          <div className="flex items-center gap-3">
            {draftMessage && <span className="text-xs font-medium text-emerald-300">{draftMessage}</span>}
            <button type="button" onClick={handleSaveDraft} className={`${buttonBase} ${buttonGhost}`}>
              Save draft
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`disabled:cursor-not-allowed disabled:opacity-60 ${buttonBase} ${buttonPrimary}`}
            >
              {isSubmitting ? "Submitting..." : mode === "edit" ? "Save changes" : isLast ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

