"use client";

import {
  formatUnits,
  type BngCategoryMetric,
  type BngMetricSummary,
} from "@/types/bng";
import { useBngLabels } from "@/queries/bng";

type Props = {
  summary: BngMetricSummary | null | undefined;
  loading?: boolean;
  title?: string;
  // "workflow": what the pathway's steps are about - baseline, proposed,
  // change and (developments) the on-site position against the target.
  // "full" adds what changes after the pathway: allocated and available
  // units (banks), off-site units secured and still needed (developments).
  scope?: "workflow" | "full";
};

function formatPercent(value: number | null) {
  if (value == null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function hasData(entry: BngCategoryMetric) {
  return entry.baseline_units > 0 || entry.proposed_units > 0 || entry.allocated_units > 0;
}

/**
 * Biodiversity units per habitat category: baseline, proposed and change,
 * plus what a habitat bank can sell or what a development still needs.
 */
export function BngMetricPanel({ summary, loading, title = "Biodiversity metric", scope = "full" }: Props) {
  const labels = useBngLabels();
  const rows = (summary?.categories ?? []).filter(hasData);
  const isBank = summary?.role === "habitat_bank";
  const full = scope === "full";
  // development: units requested but not yet accepted by the habitat bank
  const showPending = full && !isBank && rows.some((entry) => (entry.pending_units ?? 0) > 0);

  return (
    <section className="rounded-2xl border border-accent-400/20 bg-accent-500/[0.06] p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold text-fg">{title}</h3>
        <p className="text-xs text-fg/55">
          Simplified prototype metric, not the Statutory Biodiversity Metric
        </p>
      </div>

      {loading && !summary ? (
        <p className="mt-4 text-sm text-fg/60">Calculating…</p>
      ) : rows.length === 0 ? (
        <p className="mt-4 text-sm text-fg/60">No habitats recorded yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-fg/50">
              <tr>
                <th className="py-2 pr-3 font-semibold">Category</th>
                <th className="py-2 pr-3 text-right font-semibold">Baseline</th>
                <th className="py-2 pr-3 text-right font-semibold">Proposed</th>
                <th className="py-2 pr-3 text-right font-semibold">Change</th>
                {isBank ? (
                  full && (
                    <>
                      <th className="py-2 pr-3 text-right font-semibold">Allocated</th>
                      <th className="py-2 text-right font-semibold">Available</th>
                    </>
                  )
                ) : full ? (
                  <>
                    <th className="py-2 pr-3 text-right font-semibold">+10% target</th>
                    <th className="py-2 pr-3 text-right font-semibold">Off-site secured</th>
                    {showPending && <th className="py-2 pr-3 text-right font-semibold">Awaiting bank</th>}
                    <th className="py-2 text-right font-semibold">Still needed</th>
                  </>
                ) : (
                  <>
                    <th className="py-2 pr-3 text-right font-semibold">+10% target</th>
                    <th className="py-2 text-right font-semibold">On-site shortfall</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-fg/10 text-fg/85">
              {rows.map((entry) => (
                <tr key={entry.category}>
                  <td className="py-2.5 pr-3">
                    <p className="font-semibold text-fg">{labels.category(entry.category)}</p>
                    <p className="text-xs text-fg/50">{labels.unitName(entry.category)}</p>
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">{formatUnits(entry.baseline_units)}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">{formatUnits(entry.proposed_units)}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">
                    {formatUnits(entry.change_units)}
                    <span className="ml-1 text-xs text-fg/50">{formatPercent(entry.change_percent)}</span>
                  </td>
                  {isBank ? (
                    full && (
                    <>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{formatUnits(entry.allocated_units)}</td>
                      <td className="py-2.5 text-right font-semibold tabular-nums text-accent-200">
                        {formatUnits(entry.available_units)}
                      </td>
                    </>
                    )
                  ) : !full ? (
                    <>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{formatUnits(entry.target_units)}</td>
                      <td
                        className={`py-2.5 text-right font-semibold tabular-nums ${
                          (entry.onsite_shortfall_units ?? 0) <= 0 ? "text-accent-200" : "text-warning-200"
                        }`}
                      >
                        {(entry.onsite_shortfall_units ?? 0) <= 0 ? "Met" : formatUnits(entry.onsite_shortfall_units)}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{formatUnits(entry.target_units)}</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{formatUnits(entry.allocated_units)}</td>
                      {showPending && (
                        <td className="py-2.5 pr-3 text-right tabular-nums text-warning-200">{formatUnits(entry.pending_units)}</td>
                      )}
                      <td
                        className={`py-2.5 text-right font-semibold tabular-nums ${
                          entry.meets_target ? "text-accent-200" : "text-warning-200"
                        }`}
                      >
                        {entry.meets_target ? "Met" : formatUnits(entry.remaining_shortfall_units)}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isBank && summary && rows.length > 0 && (
        <p
          className={`mt-4 rounded-xl px-3 py-2 text-sm ${
            summary.meets_target
              ? "border border-accent-400/25 bg-accent-500/10 text-accent-100"
              : "border border-warning-400/25 bg-warning-500/10 text-warning-100"
          }`}
        >
          {full && summary.meets_target
            ? `The ${summary.net_gain_target_percent}% biodiversity net gain target is met for every category.`
            : summary.onsite_meets_target
              ? "The target is met on-site."
              : `The ${summary.net_gain_target_percent}% target is not met on-site yet. The shortfall can be covered with off-site units from a habitat bank.`}
        </p>
      )}

      {full && isBank && summary && rows.length > 0 && (
        <p className="mt-4 text-sm text-fg/65">
          Available units are the uplift over the baseline, less what developments have already taken.
          They can be allocated once this habitat bank is registered (all steps completed).
        </p>
      )}
    </section>
  );
}
