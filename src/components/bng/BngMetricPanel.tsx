"use client";

import {
  BNG_CATEGORY_LABEL,
  BNG_UNIT_NAME,
  formatUnits,
  type BngCategoryMetric,
  type BngMetricSummary,
} from "@/types/bng";

type Props = {
  summary: BngMetricSummary | null | undefined;
  loading?: boolean;
  title?: string;
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
export function BngMetricPanel({ summary, loading, title = "Biodiversity metric" }: Props) {
  const rows = (summary?.categories ?? []).filter(hasData);
  const isBank = summary?.role === "habitat_bank";
  // development: units requested but not yet accepted by the habitat bank
  const showPending = !isBank && rows.some((entry) => (entry.pending_units ?? 0) > 0);

  return (
    <section className="rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.06] p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="text-xs text-white/55">
          Simplified prototype metric, not the Statutory Biodiversity Metric
        </p>
      </div>

      {loading && !summary ? (
        <p className="mt-4 text-sm text-white/60">Calculating…</p>
      ) : rows.length === 0 ? (
        <p className="mt-4 text-sm text-white/60">No habitats recorded yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-white/50">
              <tr>
                <th className="py-2 pr-3 font-semibold">Category</th>
                <th className="py-2 pr-3 text-right font-semibold">Baseline</th>
                <th className="py-2 pr-3 text-right font-semibold">Proposed</th>
                <th className="py-2 pr-3 text-right font-semibold">Change</th>
                {isBank ? (
                  <>
                    <th className="py-2 pr-3 text-right font-semibold">Allocated</th>
                    <th className="py-2 text-right font-semibold">Available</th>
                  </>
                ) : (
                  <>
                    <th className="py-2 pr-3 text-right font-semibold">+10% target</th>
                    <th className="py-2 pr-3 text-right font-semibold">Off-site secured</th>
                    {showPending && <th className="py-2 pr-3 text-right font-semibold">Awaiting bank</th>}
                    <th className="py-2 text-right font-semibold">Still needed</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-white/85">
              {rows.map((entry) => (
                <tr key={entry.category}>
                  <td className="py-2.5 pr-3">
                    <p className="font-semibold text-white">{BNG_CATEGORY_LABEL[entry.category]}</p>
                    <p className="text-xs text-white/50">{BNG_UNIT_NAME[entry.category]}</p>
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">{formatUnits(entry.baseline_units)}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">{formatUnits(entry.proposed_units)}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">
                    {formatUnits(entry.change_units)}
                    <span className="ml-1 text-xs text-white/50">{formatPercent(entry.change_percent)}</span>
                  </td>
                  {isBank ? (
                    <>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{formatUnits(entry.allocated_units)}</td>
                      <td className="py-2.5 text-right font-semibold tabular-nums text-emerald-200">
                        {formatUnits(entry.available_units)}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{formatUnits(entry.target_units)}</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{formatUnits(entry.allocated_units)}</td>
                      {showPending && (
                        <td className="py-2.5 pr-3 text-right tabular-nums text-amber-200">{formatUnits(entry.pending_units)}</td>
                      )}
                      <td
                        className={`py-2.5 text-right font-semibold tabular-nums ${
                          entry.meets_target ? "text-emerald-200" : "text-amber-200"
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
              ? "border border-emerald-400/25 bg-emerald-500/10 text-emerald-100"
              : "border border-amber-400/25 bg-amber-500/10 text-amber-100"
          }`}
        >
          {summary.meets_target
            ? `The ${summary.net_gain_target_percent}% biodiversity net gain target is met for every category.`
            : summary.onsite_meets_target
              ? "The target is met on-site."
              : `The ${summary.net_gain_target_percent}% target is not met on-site yet. The shortfall can be covered with off-site units from a habitat bank.`}
        </p>
      )}

      {isBank && summary && rows.length > 0 && (
        <p className="mt-4 text-sm text-white/65">
          Available units are the uplift over the baseline, less what developments have already taken.
          They can be allocated once this habitat bank is registered (all steps completed).
        </p>
      )}
    </section>
  );
}
