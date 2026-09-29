"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { workflowService } from "@/services/workflow.service";
import { bngService } from "@/services/bng.service";
import type { WorkflowState, WorkflowStep } from "@/types/workflow";
import {
  BNG_ALLOCATION_UNIT_FIELD,
  BNG_CATEGORIES,
  BNG_CATEGORY_LABEL,
  BNG_LOCKED_STATUSES,
  BNG_STATUS_LABEL,
  formatMoney,
  formatUnits,
  type BngAllocation,
  type BngAllocationStatus,
  type BngCategory,
  type BngHabitatBank,
  type BngMetricSummary,
} from "@/types/bng";
import { FieldHelp } from "@/components/ui/FieldHelp";
import { AllocationStatusBadge } from "./AllocationStatusBadge";
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

type Units = Record<BngCategory, number>;

type AllocationRow = {
  key: string;
  bank_id: string;
  // status of the saved allocation this row edits (none for a new row)
  status?: BngAllocationStatus;
} & Record<BngCategory, string>;

const ZERO: Units = { area: 0, hedgerow: 0, watercourse: 0 };

let rowCounter = 0;

function emptyRow(): AllocationRow {
  rowCounter += 1;
  return { key: `allocation-${rowCounter}`, bank_id: "", area: "", hedgerow: "", watercourse: "" };
}

function allocationUnits(allocation: BngAllocation): Units {
  return {
    area: Number(allocation.habitat_units ?? 0),
    hedgerow: Number(allocation.hedgerow_units ?? 0),
    watercourse: Number(allocation.watercourse_units ?? 0),
  };
}

function savedAllocations(initial: unknown): BngAllocation[] {
  if (!initial || typeof initial !== "object") return [];
  const list = (initial as { allocations?: unknown }).allocations;
  return Array.isArray(list)
    ? list.filter((item): item is BngAllocation => Boolean(item) && typeof item === "object")
    : [];
}

function rowFrom(record: Record<string, unknown>): AllocationRow {
  // Saved allocations use *_units numbers; drafts store the rows as-is.
  const value = (category: BngCategory) => {
    const raw = record[BNG_ALLOCATION_UNIT_FIELD[category]] ?? record[category];
    return raw == null || Number(raw) === 0 ? "" : String(raw);
  };
  return {
    ...emptyRow(),
    bank_id: String(record.habitat_bank_case_id ?? record.bank_id ?? ""),
    status: (record.status as BngAllocationStatus | undefined) ?? undefined,
    area: value("area"),
    hedgerow: value("hedgerow"),
    watercourse: value("watercourse"),
  };
}

function rowUnits(row: AllocationRow): Units {
  return { area: Number(row.area) || 0, hedgerow: Number(row.hedgerow) || 0, watercourse: Number(row.watercourse) || 0 };
}

function cost(units: Units, prices?: Record<BngCategory, number | null>): number | null {
  let total = 0;
  for (const category of BNG_CATEGORIES) {
    if (units[category] <= 0) continue;
    const price = prices?.[category];
    if (price == null) return null;
    total += units[category] * price;
  }
  return total;
}

// Where a bank is, so two banks with the same name can be told apart.
function bankPlace(bank: BngHabitatBank): string {
  return [bank.site_names?.join(", "), bank.countries?.join(", ")].filter(Boolean).join(", ");
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
  const saved = useMemo(() => savedAllocations(initialValues), [initialValues]);
  // Declined / released requests are history, not editable rows.
  const history = saved.filter((a) => a.status === "declined" || a.status === "released");

  const [banks, setBanks] = useState<BngHabitatBank[] | null>(null);
  const [summary, setSummary] = useState<BngMetricSummary | null>(null);
  const [rows, setRows] = useState<AllocationRow[]>(() => {
    const initial = savedAllocations(initialValues)
      .filter((a) => a.status !== "declined" && a.status !== "released")
      .map((a) => rowFrom(a as unknown as Record<string, unknown>));
    if (initial.length === 0 && initialValues && typeof initialValues === "object") {
      // a draft: { allocations: [row, ...] } without statuses
      const draftRows = (initialValues as { allocations?: unknown[] }).allocations;
      if (Array.isArray(draftRows) && draftRows.length && !("status" in (draftRows[0] as object))) {
        return draftRows.map((r) => rowFrom(r as Record<string, unknown>));
      }
    }
    return initial.length > 0 ? initial : [emptyRow()];
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");

  useEffect(() => {
    bngService.listHabitatBanks().then(setBanks).catch(() => setBanks([]));
    bngService.getCaseMetric(state.case_id).then(setSummary).catch(() => setSummary(null));
  }, [state.case_id]);

  // Listed availability already excludes this development's own active
  // allocations; add them back so a saved request can be kept or changed.
  const bankOptions = useMemo(() => {
    const byId = new Map<
      number,
      { id: number; name: string; place: string; max: Units; prices?: Record<BngCategory, number | null> }
    >();
    for (const bank of banks ?? []) {
      byId.set(bank.case_id, {
        id: bank.case_id,
        name: bank.name ?? "Habitat bank",
        place: bankPlace(bank),
        max: { ...ZERO, ...bank.available_units },
        prices: bank.prices,
      });
    }
    for (const allocation of saved) {
      if (allocation.status === "declined" || allocation.status === "released") continue;
      const id = allocation.habitat_bank_case_id;
      const entry = byId.get(id) ?? {
        id,
        name: allocation.habitat_bank_name ?? "Habitat bank",
        place: "",
        max: { ...ZERO },
        prices: {
          area: allocation.price_per_habitat_unit ?? null,
          hedgerow: allocation.price_per_hedgerow_unit ?? null,
          watercourse: allocation.price_per_watercourse_unit ?? null,
        },
      };
      const units = allocationUnits(allocation);
      for (const category of BNG_CATEGORIES) entry.max[category] += units[category];
      byId.set(id, entry);
    }
    return Array.from(byId.values());
  }, [banks, saved]);

  const needed = useMemo(() => {
    const result = { ...ZERO };
    for (const entry of summary?.categories ?? []) result[entry.category] = entry.onsite_shortfall_units ?? 0;
    return result;
  }, [summary]);

  const totals = useMemo(() => {
    const result = { ...ZERO };
    for (const row of rows) {
      const units = rowUnits(row);
      for (const category of BNG_CATEGORIES) result[category] += units[category];
    }
    return result;
  }, [rows]);

  const stillNeeded = useMemo(() => {
    const result = { ...ZERO };
    for (const category of BNG_CATEGORIES) result[category] = Math.max(needed[category] - totals[category], 0);
    return result;
  }, [needed, totals]);

  const nothingNeeded = BNG_CATEGORIES.every((category) => needed[category] <= 0);
  const usedBankIds = new Set(rows.map((row) => row.bank_id).filter(Boolean));

  // Matching (diagram step 10): banks ranked by how much of the remaining
  // need they can cover, with the cost of doing so at their prices.
  const suggestions = useMemo(() => {
    const totalNeed = BNG_CATEGORIES.reduce((sum, category) => sum + stillNeeded[category], 0);
    if (totalNeed <= 0) return [];
    return bankOptions
      .filter((option) => !usedBankIds.has(String(option.id)))
      .map((option) => {
        const take = { ...ZERO };
        for (const category of BNG_CATEGORIES) take[category] = Math.min(option.max[category], stillNeeded[category]);
        const covered = BNG_CATEGORIES.reduce((sum, category) => sum + take[category], 0);
        return { option, take, coverage: covered / totalNeed, cost: cost(take, option.prices) };
      })
      .filter((suggestion) => suggestion.coverage > 0)
      .sort((a, b) => b.coverage - a.coverage || (a.cost ?? Infinity) - (b.cost ?? Infinity))
      .slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankOptions, stillNeeded, rows]);

  const isLast = !step.next;

  function updateRow(key: string, patch: Partial<AllocationRow>) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function applySuggestion(bankId: number, take: Units) {
    const filled: AllocationRow = {
      ...emptyRow(),
      bank_id: String(bankId),
      area: take.area ? String(Number(take.area.toFixed(2))) : "",
      hedgerow: take.hedgerow ? String(Number(take.hedgerow.toFixed(2))) : "",
      watercourse: take.watercourse ? String(Number(take.watercourse.toFixed(2))) : "",
    };
    setRows((current) => {
      const withoutBlank = current.filter((row) => row.bank_id || row.area || row.hedgerow || row.watercourse);
      return [...withoutBlank, filled];
    });
  }

  async function handleSubmit() {
    setError("");
    const allocations = rows
      .filter((row) => row.bank_id)
      .map((row) => ({
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
      setError(err?.fieldErrors?.allocations || err?.message || "Could not save the reservation.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveDraft() {
    try {
      await workflowService.saveDraft(state.case_id, stepCode, {
        allocations: rows.map(({ key, status, ...row }) => row),
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
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-1.5">
            <p className="text-sm text-white/60">
              Request units from registered habitat banks to cover the shortfall that can&apos;t be met on-site.
              Each habitat bank accepts or declines your request.
            </p>
            {field && <FieldHelp text={field.help_text} label={field.display_name} />}
          </div>
          <Link href="/bng/marketplace" className="text-sm font-semibold !text-emerald-200 hover:!text-emerald-100">
            Browse the marketplace →
          </Link>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          {BNG_CATEGORIES.map((category) => {
            const covered = totals[category] >= needed[category];
            return (
              <div key={category} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/45">{BNG_CATEGORY_LABEL[category]}</p>
                <p className="mt-1 text-sm text-white">
                  Needed off-site: <span className="font-semibold tabular-nums">{formatUnits(needed[category])}</span>
                </p>
                <p className={`text-sm ${covered ? "text-emerald-200" : "text-amber-200"}`}>
                  Requested: <span className="font-semibold tabular-nums">{formatUnits(totals[category])}</span>
                </p>
              </div>
            );
          })}
        </div>

        {nothingNeeded && summary && (
          <p className="mb-4 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            The 10% target is met on-site, so no off-site units are needed. You can continue without requesting any.
          </p>
        )}

        {suggestions.length > 0 && (
          <div className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.06] p-4">
            <p className="text-sm font-semibold text-white">Suggested habitat banks</p>
            <ul className="mt-2 space-y-2">
              {suggestions.map(({ option, take, coverage, cost: estimate }) => (
                <li key={option.id} className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <span className="text-white/85">
                    <span className="font-semibold text-white">{option.name}</span>
                    {option.place && <span className="text-white/55"> ({option.place})</span>}
                    {" · "}covers {Math.round(coverage * 100)}% of what you still need
                    {estimate != null && ` · about ${formatMoney(estimate)}`}
                  </span>
                  <button type="button" onClick={() => applySuggestion(option.id, take)} className={`${buttonBaseSm} ${buttonPrimary}`}>
                    Use
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
        )}

        {banks !== null && bankOptions.length === 0 ? (
          <p className="text-sm text-white/60">
            No registered habitat banks have units available yet. A habitat bank becomes available once all of its
            steps are completed.
          </p>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => {
              const bank = bankOptions.find((option) => String(option.id) === row.bank_id);
              const locked = row.status ? BNG_LOCKED_STATUSES.includes(row.status) : false;
              const rowCost = bank ? cost(rowUnits(row), bank.prices) : null;
              return (
                <div key={row.key} className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                    <label className="space-y-1">
                      <span className="flex items-center gap-2 text-xs font-medium text-white/70">
                        Habitat bank {row.status && <AllocationStatusBadge status={row.status} />}
                      </span>
                      <select
                        value={row.bank_id}
                        onChange={(e) => updateRow(row.key, { bank_id: e.target.value })}
                        disabled={locked || Boolean(row.status)}
                        className={`${inputClass} disabled:opacity-70`}
                      >
                        <option value="">{banks === null ? "Loading…" : "Select habitat bank"}</option>
                        {bankOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                            {option.place && ` (${option.place})`}
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
                          disabled={!bank || locked}
                          className={`${inputClass} disabled:opacity-50`}
                        />
                        {bank && !locked && (
                          <span className="block text-xs text-white/50">
                            Up to {formatUnits(bank.max[category])}
                            {bank.prices?.[category] != null && ` · ${formatMoney(bank.prices[category])}/unit`}
                          </span>
                        )}
                      </label>
                    ))}

                    <div className="flex items-end">
                      {!locked && (
                        <button
                          type="button"
                          onClick={() => setRows((current) => (current.length === 1 ? [emptyRow()] : current.filter((r) => r.key !== row.key)))}
                          className={`${buttonBaseSm} ${buttonGhost}`}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-white/55">
                    {locked
                      ? `These units are ${row.status} and can no longer be changed.`
                      : row.status === "reserved"
                        ? "Accepted by the habitat bank. Changing the amount sends a new request."
                        : row.status === "requested"
                          ? "Waiting for the habitat bank to accept."
                          : "A new request."}
                    {rowCost != null && ` Cost: ${formatMoney(rowCost)}.`}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-5 rounded-xl border border-white/10 bg-black/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/45">Earlier requests</p>
            <ul className="mt-2 space-y-1 text-sm text-white/65">
              {history.map((allocation) => (
                <li key={allocation.id ?? allocation.habitat_bank_case_id}>
                  {allocation.habitat_bank_name ?? "Habitat bank"} ·{" "}
                  {BNG_STATUS_LABEL[allocation.status as BngAllocationStatus]}
                </li>
              ))}
            </ul>
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
